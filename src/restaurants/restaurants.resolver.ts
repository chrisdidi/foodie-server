import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AddDishInput, AddDishOutput } from './dtos/add-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-account.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { UpdateDishInput, UpdateDishOutput } from './dtos/update-dish.dto';
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

  @Query(() => MyRestaurantOutput)
  @Role(['RestaurantOwner'])
  async myRestaurant(
    @AuthUser() authUser: User,
    @Args('input') input: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    return this.restaurantService.myRestaurant(authUser, input);
  }

  @Mutation(() => AddDishOutput)
  @Role(['RestaurantOwner'])
  async addDish(
    @AuthUser() authUser: User,
    @Args('input') input: AddDishInput,
  ): Promise<AddDishOutput> {
    return this.restaurantService.addDish(authUser, input);
  }

  @Mutation(() => DeleteDishOutput)
  @Role(['RestaurantOwner'])
  async deleteDish(
    @AuthUser() authUser: User,
    @Args('input') input: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(authUser, input);
  }

  @Mutation(() => UpdateDishOutput)
  @Role(['RestaurantOwner'])
  async updateDish(
    @AuthUser() authUser: User,
    @Args('input') input: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    return this.restaurantService.updateDish(authUser, input);
  }
}
