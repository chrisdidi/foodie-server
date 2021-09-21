import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import {
  badRequestError,
  internalServerError,
  notFoundError,
  unauthorizedError,
} from 'src/helpers/http-codes';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemOutput } from './dtos/create-order-item.dto';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { CreateStatusHistoryOutput } from './dtos/create-status-history.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import {
  GetOrdersInput,
  GetOrdersOutput,
  OrderWithStatus,
} from './dtos/get-orders.dto';
import { SeenOrderInput, SeenOrderOutput } from './dtos/seen-order.dto';
import {
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
} from './dtos/update-order-status.dto';
import { OrderItem } from './entities/order-item.entity';
import {
  OrderStatusHistory,
  OrderStatusStatus,
} from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import {
  regUserSequence,
  restOwnerSequence,
  statusMap,
} from './orders.constants';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(OrderStatusHistory)
    private readonly orderStatusHistory: Repository<OrderStatusHistory>,
    private readonly restaurantService: RestaurantsService,
    private readonly cartService: CartService,
  ) {}

  async isAuthenticated(user: User, orderId: number): Promise<boolean> {
    const order = await this.orders.findOne(
      { id: orderId },
      { relations: ['restaurant'] },
    );
    if (!order) return false;
    if (user.role === UserRole.RegularUser && user.id !== order.userId)
      return false;
    if (
      user.role === UserRole.RestaurantOwner &&
      user.id !== order.restaurant.ownerId
    )
      return false;

    return true;
  }
  findNextStatus(
    user: User,
    order: Order,
    curStatus?: OrderStatusStatus,
  ): OrderStatusStatus | undefined {
    const regUser = user.role === UserRole.RegularUser;
    if (!curStatus) {
      if (regUser && user.id === order.userId) return statusMap[0].status;
      return;
    }
    const statusLowerCase = curStatus.toLowerCase();
    const nextKey = regUser
      ? regUserSequence[statusLowerCase]
      : restOwnerSequence[statusLowerCase];
    if (nextKey) return statusMap[nextKey].status;
    return;
  }

  async createStatusHistory(
    user: User,
    order: Order,
  ): Promise<CreateStatusHistoryOutput> {
    try {
      const isAuthticated = await this.isAuthenticated(user, order.id);
      if (!isAuthticated) return unauthorizedError();
      const currentStatus = await this.orderStatusHistory.findOne({
        where: {
          order,
        },
        order: {
          id: 'DESC',
        },
      });
      const statusName = this.findNextStatus(
        user,
        order,
        currentStatus?.status,
      );
      if (statusName) {
        const status = await this.orderStatusHistory.save(
          this.orderStatusHistory.create({
            user,
            order,
            status: statusName,
          }),
        );
        return {
          ok: true,
          status,
        };
      } else {
        return unauthorizedError();
      }
    } catch (error) {
      return internalServerError();
    }
  }

  async createOrder(
    user: User,
    input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      if (!user) return badRequestError('Cannot process this request.');
      const { cart, error: cartError } = await this.cartService.myCart(user);

      if (cartError)
        return {
          ok: false,
          error: cartError,
        };

      if (!cart || cart.cartItems.length <= 0)
        return badRequestError(
          "You don't have anything in cart or some of your items no longer available in the restaurant.",
        );

      if (!cart.restaurant)
        return badRequestError(
          'The restaurant no longer exists. Please refresh and try another restaurant.',
        );

      const order = await this.orders.save(
        this.orders.create({
          ...input,
          price: cart.totalPrice,
          restaurant: cart.restaurant,
          user: user,
        }),
      );
      for (let i = 0; i < cart.cartItems.length; i++) {
        const { dish, quantity } = cart.cartItems[i];
        const { error: orderItemError } = await this.createOrderItem({
          name: dish.name,
          description: dish.description,
          photo: dish.photo,
          price: dish.price,
          quantity,
          order,
          dish,
        });
        if (orderItemError) {
          await this.orders.delete({ id: order.id });
          return internalServerError();
        }
      }
      const { error: statusError } = await this.createStatusHistory(
        user,
        order,
      );
      if (statusError) {
        await this.orders.delete({ id: order.id });
        return {
          ok: false,
          error: statusError,
        };
      }
      // clear cart after success
      await this.cartService.deleteCart(user);
      return {
        ok: true,
        orderId: order.id,
      };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }

  async createOrderItem(
    orderItemInput: Partial<OrderItem>,
  ): Promise<CreateOrderItemOutput> {
    try {
      const orderItem = await this.orderItems.save(
        this.orderItems.create(orderItemInput),
      );

      return {
        ok: true,
        orderItem,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async getOrder(
    user: User,
    { id, restaurantId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(
        { id, ...(restaurantId ? { restaurant: { id: restaurantId } } : {}) },
        { relations: ['restaurant', 'user'] },
      );
      if (!order) return notFoundError('Order not found!');
      const isAuthenticated = await this.isAuthenticated(user, id);
      if (!isAuthenticated) return notFoundError('Order not found!');

      const orderItems = await this.orderItems.find({
        where: {
          order: {
            id: order.id,
          },
        },
        relations: ['dish'],
      });
      const orderStatus = await this.orderStatusHistory.find({
        where: {
          order: {
            id: order.id,
          },
        },
        relations: ['user'],
        order: {
          id: 'DESC',
        },
      });
      order.items = orderItems;
      if (orderStatus && orderStatus.length > 0) {
        order.statusHistory = orderStatus;
      }
      const userBlocked = order.restaurant.blocked.findIndex(
        (bu) => bu.id === order.user.id,
      );
      const orderWithStatus = {
        ...order,
        status: orderStatus[0]?.status || statusMap[0].status,
        userBlocked: userBlocked > -1,
      };
      return {
        ok: true,
        order: orderWithStatus,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async getOrders(
    user: User,
    { id: restaurantId }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const ordersRaw = await this.orders
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.restaurant', 'restaurant')
        .leftJoinAndSelect('restaurant.owner', 'owner')
        .leftJoinAndSelect('order.items', 'items')
        .leftJoinAndSelect('order.statusHistory', 'statusHistory')
        .leftJoinAndSelect('order.user', 'user')
        .where(
          user.role === UserRole.RegularUser
            ? 'order.userId = :userId'
            : `owner.id = :ownerId${
                restaurantId ? ' AND restaurant.id = :restaurantId' : ''
              }`,
          {
            userId: user.id,
            ownerId: user.id,
            restaurantId,
          },
        )
        .orderBy({ 'order.id': 'DESC', 'statusHistory.id': 'DESC' })
        .getMany();

      const orders: OrderWithStatus[] = [];
      for (let i = 0; i < ordersRaw.length; i++) {
        const order: OrderWithStatus = {
          ...ordersRaw[i],
          status: ordersRaw[i]?.statusHistory[0]?.status,
          userBlocked: false,
        };
        orders.push(order);
      }

      return {
        ok: true,
        orders,
        restaurant:
          user.role === UserRole.RestaurantOwner && restaurantId
            ? orders[0]?.restaurant || null
            : null,
      };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }

  async seenOrder(
    user: User,
    { id }: SeenOrderInput,
  ): Promise<SeenOrderOutput> {
    try {
      const order = await this.orders.findOne(
        { id },
        { relations: ['restaurant'] },
      );
      if (!order) {
        return notFoundError('Order not found!');
      }
      const isAuthenticated = await this.isAuthenticated(user, id);
      if (!isAuthenticated) return unauthorizedError();
      await this.orders.update(
        { id },
        user.role === UserRole.RegularUser
          ? { userSeen: true }
          : { restaurantSeen: true },
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }

  async updateOrderStatus(
    user: User,
    { id }: UpdateOrderStatusInput,
  ): Promise<UpdateOrderStatusOutput> {
    try {
      const order = await this.orders.findOne(
        { id },
        { relations: ['restaurant'] },
      );
      if (!order) return notFoundError('Order not found!');
      const isAuthenticated = await this.isAuthenticated(user, id);
      if (!isAuthenticated) return unauthorizedError();
      const { status, error: statusError } = await this.createStatusHistory(
        user,
        order,
      );
      if (statusError) {
        return {
          ok: false,
          error: statusError,
        };
      }
      await this.orders.update(
        { id },
        user.role === UserRole.RestaurantOwner
          ? { restaurantSeen: true, userSeen: false }
          : { restaurantSeen: false, userSeen: true },
      );
      return {
        ok: true,
        status,
      };
    } catch (error) {
      console.log(error);
      return internalServerError(
        'Failed to update order status! Please try again.',
      );
    }
  }
}
