import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { MyRestaurantOutput } from 'src/restaurants/dtos/my-restaurant.dto';
import { User } from 'src/users/entities/user.entity';
import { CartService } from './cart.service';
import { AddToCartInput, AddToCartOutput } from './dtos/add-to-cart.dto';
import { MyCartOutput } from './dtos/my-cart.dto';

@Resolver()
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => AddToCartOutput)
  @Role(['RegularUser'])
  async addToCart(
    @AuthUser() authUser: User,
    @Args('input') input: AddToCartInput,
  ): Promise<AddToCartOutput> {
    return this.cartService.addToCart(authUser, input);
  }

  @Query(() => MyCartOutput)
  @Role(['RegularUser'])
  async myCart(@AuthUser() authUser: User): Promise<MyRestaurantOutput> {
    return this.cartService.myCart(authUser);
  }
}
