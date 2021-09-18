import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import {
  badRequestError,
  internalServerError,
  unauthorizedError,
} from 'src/helpers/http-codes';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderItemOutput } from './dtos/create-order-item.dto';
import { CreateOrderOutput } from './dtos/create-order.dto';
import { CreateStatusHistoryOutput } from './dtos/create-status-history.dto';
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

  async createOrder(user: User): Promise<CreateOrderOutput> {
    try {
      if (!user) return badRequestError('Cannot process this request.');
      const { cart, error: cartError } = await this.cartService.myCart(user);

      if (cartError)
        return {
          ok: false,
          error: cartError,
        };

      if (!cart || cart.cartItems.length <= 0)
        return badRequestError("You don't have anything in cart!");

      if (!cart.restaurant)
        return badRequestError(
          'The restaurant no longer exists. Please refresh and try another restaurant.',
        );

      const order = await this.orders.save(
        this.orders.create({
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
}
