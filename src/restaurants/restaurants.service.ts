import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/common.constants';
import { ERROR_NAMES } from 'src/helpers/http-codes';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-account.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const restaurant = this.restaurants.create(input);
      restaurant.owner = owner;

      await this.restaurants.save(restaurant);
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: INTERNAL_SERVER_ERROR_MESSAGE,
        },
      };
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({ owner });
      return {
        ok: true,
        restaurants,
      };
    } catch (error) {
      // log error with Sentry
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: INTERNAL_SERVER_ERROR_MESSAGE,
        },
      };
    }
  }
}
