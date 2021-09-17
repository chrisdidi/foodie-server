import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartService } from 'src/cart/cart.service';
import { internalServerError } from 'src/helpers/http-codes';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';

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

  async create(user: User): Promise<CreateOrderOutput> {
    try {
      const { cart, error: cartError } = await this.cartService.myCart(user);
      if (cartError)
        return {
          ok: false,
          error: cartError,
        };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }
}
