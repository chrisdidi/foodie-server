import { Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderOutput } from './dtos/create-order.dto';
import { OrdersService } from './orders.service';

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['RegularUser'])
  async createOrder(@AuthUser() user: User): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(user);
  }
}
