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
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
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

  async myRestaurant(
    owner: User,
    { id }: MyRestaurantInput,
  ): Promise<MyRestaurantOutput> {
    try {
      const notFoundError =
        "Restaurant not found or you don't have permission to view it.";
      if (!id)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.BAD_REQUEST,
            message: 'ID not provided',
          },
        };
      const restaurant = await this.restaurants.findOne({
        id,
        ownerId: owner.id,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message: notFoundError,
          },
        };
      }
      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message: notFoundError,
          },
        };
      }

      return {
        ok: true,
        restaurant: {
          ...restaurant,
          hasIncompleteOrders: true,
        },
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
}
