import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-account.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { RestaurantsService } from './restaurants.service';

@Resolver()
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateRestaurantOutput)
  @Role(['RestaurantOwner'])
  async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, input);
  }

  @Query(() => MyRestaurantsOutput)
  @Role(['RestaurantOwner'])
  async myRestaurants(
    @AuthUser() authUser: User,
  ): Promise<MyRestaurantsOutput> {
    return this.restaurantService.myRestaurants(authUser);
  }
}
