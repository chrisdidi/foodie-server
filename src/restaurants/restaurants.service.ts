import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/common.constants';
import {
  badRequestError,
  ERROR_NAMES,
  notFoundError,
  unauthorizedError,
} from 'src/helpers/http-codes';
import { extractAndCountKeywords } from 'src/helpers/util';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AddDishInput, AddDishOutput } from './dtos/add-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-account.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createRestaurant(
    owner: User,
    input: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const restaurant = this.restaurants.create(input);
      restaurant.owner = owner;
      restaurant.keywords = extractAndCountKeywords({}, input.name);
      restaurant.keywords = extractAndCountKeywords(
        restaurant.keywords,
        input.description,
      );
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
      const restaurant = await this.restaurants.findOne(
        { id },
        { relations: ['dishes'] },
      );
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
      console.log(error);
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: INTERNAL_SERVER_ERROR_MESSAGE,
        },
      };
    }
  }

  async addDish(
    owner: User,
    { name, description, price, restaurantId }: AddDishInput,
  ): Promise<AddDishOutput> {
    try {
      // validate input
      if (!restaurantId || !name || !price) return badRequestError();

      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) return notFoundError('Restaurant not found!');
      if (owner.id !== restaurant.ownerId) return unauthorizedError();

      const dish = this.dishes.create({
        name,
        description,
        price,
        restaurantId,
        restaurant,
      });

      restaurant.keywords = extractAndCountKeywords(
        restaurant.keywords || {},
        name,
      );
      restaurant.keywords = extractAndCountKeywords(
        restaurant.keywords,
        description,
      );
      await this.dishes.save(dish);
      await this.restaurants.save(restaurant);

      return {
        ok: true,
        dish,
      };
    } catch (error) {
      console.log(error);
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
