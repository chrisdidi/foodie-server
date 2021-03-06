import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  badRequestError,
  ERROR_NAMES,
  internalServerError,
  notFoundError,
  unauthorizedError,
} from 'src/helpers/http-codes';
import { extractAndCountKeywords } from 'src/helpers/util';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Raw, Repository } from 'typeorm';
import { AddDishInput, AddDishOutput } from './dtos/add-dish.dto';
import { BlockUserInput, BlockUserOutput } from './dtos/block-user.dto';
import {
  BrowseRestaurantsInput,
  BrowseRestaurantsOutput,
} from './dtos/browse-restaurants.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-account.dto';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { GetDishByIdInput, GetDishByIdOutput } from './dtos/get-dish-by-id.dto';
import {
  MyRestaurantInput,
  MyRestaurantOutput,
} from './dtos/my-restaurant.dto';
import { MyRestaurantsOutput } from './dtos/my-restaurants.dto';
import { UpdateDishInput, UpdateDishOutput } from './dtos/update-dish.dto';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dtos/update-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    private readonly usersService: UsersService,
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
      return internalServerError();
    }
  }

  async deleteRestaurant(
    owner: User,
    { id }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      if (!id)
        return badRequestError('You must a provide an ID you want to delete.');
      const restaurant = await this.restaurants.findOne({ id });
      if (!restaurant) return notFoundError('Restaurant not found!');
      if (restaurant.ownerId !== owner.id) return unauthorizedError();

      await this.restaurants.delete({ id });

      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async updateRestaurant(
    owner: User,
    { id, name, description, backgroundImage }: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    try {
      if (!id)
        return badRequestError('You must provide id of restaurant to update');

      const restaurant = await this.restaurants.findOne({ id });
      if (!restaurant) return notFoundError('Restaurant not found!');

      if (restaurant.ownerId !== owner.id) return unauthorizedError();
      if (name) {
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          restaurant.name,
          true,
        );
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          name,
        );
        restaurant.name = name;
      }
      if (description !== restaurant.description) {
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          restaurant.description,
          true,
        );
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          description,
        );
        restaurant.description = description;
      }
      if (backgroundImage && backgroundImage !== restaurant.backgroundImage) {
        restaurant.backgroundImage = backgroundImage;
      }

      await this.restaurants.save(restaurant);

      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async myRestaurants(owner: User): Promise<MyRestaurantsOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner },
        relations: ['orders'],
      });
      for (let i = 0; i < restaurants.length; i++) {
        restaurants[i].orderCounts = restaurants[i].orders.length;
      }
      return {
        ok: true,
        restaurants,
      };
    } catch (error) {
      // log error with Sentry
      return internalServerError();
    }
  }

  async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    try {
      return await this.restaurants.findOne({ id });
    } catch (error) {
      console.log(error);
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
      return internalServerError();
    }
  }

  async addDish(
    owner: User,
    { name, description, photo, price, restaurantId }: AddDishInput,
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
        photo,
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
      return internalServerError();
    }
  }

  async deleteDish(
    owner: User,
    { id }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dishes.findOne(
        { id },
        {
          relations: ['restaurant'],
        },
      );
      if (!dish) return notFoundError('Dish not found!');
      const restaurant = await this.restaurants.findOne(dish.restaurantId);
      if (restaurant.ownerId !== owner.id) return unauthorizedError();
      restaurant.keywords = extractAndCountKeywords(
        restaurant.keywords,
        dish.name,
        true,
      );
      restaurant.keywords = extractAndCountKeywords(
        restaurant.keywords,
        dish.description,
        true,
      );
      await this.restaurants.save(restaurant);
      await this.dishes.delete({ id });
      return {
        ok: true,
        dish,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async getDishById(
    owner: User,
    { id }: GetDishByIdInput,
  ): Promise<GetDishByIdOutput> {
    try {
      const dish = await this.dishes.findOne(id);
      if (!dish) return notFoundError('Dish not found');

      return {
        ok: true,
        dish,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async updateDish(
    owner: User,
    { description, id, photo, price, name }: UpdateDishInput,
  ): Promise<UpdateDishOutput> {
    try {
      const dish = await this.dishes.findOne(id);
      if (!dish) return notFoundError('Dish not found!');

      const restaurant = await this.restaurants.findOne(dish.restaurantId);
      if (restaurant.ownerId !== owner.id) return unauthorizedError();
      if (name) {
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          dish.name,
          true,
        );
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          name,
        );
        dish.name = name;
      }
      if (description !== dish.description) {
        if (dish.description) {
          restaurant.keywords = extractAndCountKeywords(
            restaurant.keywords,
            dish.description,
            true,
          );
        }
        restaurant.keywords = extractAndCountKeywords(
          restaurant.keywords,
          description,
        );
        dish.description = description;
      }
      if (typeof price === 'number') dish.price = price;
      if (photo) dish.photo = photo;
      await this.dishes.save(dish);
      return {
        ok: true,
        dish,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  async browseRestaurants(
    user: User,
    { limit = 10, query = '', offset = 0 }: BrowseRestaurantsInput,
  ): Promise<BrowseRestaurantsOutput> {
    query = query.toLowerCase();
    const queryWords = extractAndCountKeywords({}, query);
    const browseWhere = () => {
      const queries = [];
      if (query && queryWords && Object.keys(queryWords).length > 0) {
        for (const queryWord in queryWords) {
          queries.push({
            keywords: Raw(
              () => `(keywords::jsonb->'${queryWord}') is not null`,
            ),
          });
        }
        return queries;
      } else {
        return queries;
      }
    };

    const restaurants = await this.restaurants
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.dishes', 'dishes')
      .where(browseWhere())
      .andWhere(
        user
          ? `${user.id} NOT IN (SELECT rb."userId" FROM restaurant_blocked_user rb WHERE rb."restaurantId" = restaurant.id)`
          : 'true',
      )
      .skip(offset >= 0 ? offset * limit : 0)
      .take(limit)
      .getMany();

    return {
      ok: true,
      restaurants,
    };
  }

  async blockUserFromRestaurant(
    user: User,
    { blockId, restaurantId, all, unblock }: BlockUserInput,
  ): Promise<BlockUserOutput> {
    try {
      let restaurants: Restaurant[];
      if (all) {
        restaurants = await this.restaurants.find({ owner: { id: user.id } });
      } else if (restaurantId) {
        restaurants = await this.restaurants.find({ id: restaurantId });
      }
      if (!restaurants || restaurants.length === 0)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message: 'No restaurant found!',
          },
        };
      const userToBlock = await this.usersService.findById(blockId);

      if (!userToBlock.user)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message: 'User not found!',
          },
        };
      for (let i = 0; i < restaurants.length; i++) {
        const blocked = await this.isUserBlocked(
          userToBlock.user,
          restaurants[i],
        );
        console.log(blocked);
        if (!blocked && !unblock) {
          await this.restaurants
            .createQueryBuilder('restaurant')
            .relation('blocked')
            .of(restaurants[i].id)
            .add(userToBlock.user);
        } else if (blocked && unblock) {
          await this.restaurants
            .createQueryBuilder('restaurant')
            .relation('blocked')
            .of(restaurants[i].id)
            .remove(blockId);
        }
      }
      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }

  async isUserBlocked(user: User, restaurant: Restaurant): Promise<boolean> {
    try {
      if (!restaurant) return false;
      const blocked = await this.restaurants
        .createQueryBuilder()
        .relation('blocked')
        .of(restaurant.id)
        .loadMany();
      for (let i = 0; i < blocked.length; i++) {
        if (blocked[i].id === user.id) return true;
      }
      return false;
    } catch (error) {
      console.log(error);
      return true;
    }
  }
}
