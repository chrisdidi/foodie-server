import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { SeenOrderInput, SeenOrderOutput } from './dtos/seen-order.dto';
import {
  UpdateOrderStatusInput,
  UpdateOrderStatusOutput,
} from './dtos/update-order-status.dto';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['RegularUser'])
  async createOrder(
    @AuthUser() user: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(user, input);
  }

  @Query(() => GetOrderOutput)
  @Role(['RegularUser', 'RestaurantOwner'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') input: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, input);
  }

  @Query(() => GetOrdersOutput)
  @Role(['RegularUser', 'RestaurantOwner'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input', { nullable: true }) input: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, input || {});
  }

  @Mutation(() => SeenOrderOutput)
  @Role(['RegularUser', 'RestaurantOwner'])
  async seenOrder(
    @AuthUser() user: User,
    @Args('input') input: SeenOrderInput,
  ): Promise<SeenOrderOutput> {
    return this.ordersService.seenOrder(user, input);
  }

  @Mutation(() => UpdateOrderStatusOutput)
  @Role(['RegularUser', 'RestaurantOwner'])
  async updateOrderStatus(
    @AuthUser() user: User,
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<UpdateOrderStatusOutput> {
    return this.ordersService.updateOrderStatus(user, input);
  }
}
