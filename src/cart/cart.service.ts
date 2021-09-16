import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_NAMES,
  internalServerError,
  unauthorizedError,
} from 'src/helpers/http-codes';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { RestaurantsService } from 'src/restaurants/restaurants.service';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AddToCartInput, AddToCartOutput } from './dtos/add-to-cart.dto';
import { CreateCartOutput } from './dtos/create-cart.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cart: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItem: Repository<CartItem>,
    private readonly restaurantsService: RestaurantsService,
  ) {}
  async createCart(user: User): Promise<CreateCartOutput> {
    try {
      const cart = await this.cart.save(this.cart.create({ user }));
      return {
        ok: true,
        cart,
      };
    } catch (error) {
      return internalServerError();
    }
  }

  calculatePrice(cartItem: CartItem[]) {
    let price = 0;
    for (let i = 0; i < cartItem.length; i++) {
      price = price + +(cartItem[i].dish.price * cartItem[i].quantity);
    }
    return +price.toPrecision(2);
  }
  async addToCart(
    user: User,
    { dishId, quantity }: AddToCartInput,
  ): Promise<AddToCartOutput> {
    try {
      if (user.role !== UserRole.RegularUser) return unauthorizedError();

      const cartExists = await this.cart.findOne(
        { user },
        { relations: ['cartItems', 'restaurant', 'cartItems.dish'] },
      );
      const { dish } = await this.restaurantsService.getDishById(user, {
        id: dishId,
      });
      // don't process deleted dishes
      // cartItems are automatically deleted due to DB relations
      if (!dish) {
        return {
          ok: false,
          cart: cartExists
            ? {
                restaurant: cartExists.restaurant,
                cartItems: cartExists.cartItems,
                totalPrice: this.calculatePrice(cartExists.cartItems),
              }
            : {
                cartItems: [],
                totalPrice: 0,
              },
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message:
              'The dish may have been deleted! Please refresh your browser for up-to-date data.',
          },
        };
      }
      let cart: Cart;
      if (!cartExists) {
        let restaurantId;
        if (quantity > 0) {
          restaurantId = dish.restaurantId;
          cart = await this.cart.save(this.cart.create({ user, restaurantId }));
          const newCartItem = await this.cartItem.save(
            this.cartItem.create({ dish, quantity, cart }),
          );
          const restaurant = await this.restaurantsService.getRestaurantById(
            dish.restaurantId,
          );
          return {
            ok: true,
            cart: {
              restaurant,
              cartItems: [newCartItem],
              totalPrice: +(dish.price * quantity).toFixed(2),
            },
          };
        }
        return {
          ok: true,
          cart: {
            cartItems: [],
            totalPrice: 0,
          },
        };
      }
      cart = cartExists;
      const restaurant = await this.restaurantsService.getRestaurantById(
        dish.restaurantId,
      );
      if (restaurant.id !== cart.restaurantId) {
        await this.cartItem.delete({ cartId: cart.id });
        const addedItem = await this.cartItem.save(
          this.cartItem.create({
            cartId: cart.id,
            dish,
          }),
        );
        await this.cart.update(
          { id: cart.id },
          { restaurantId: restaurant.id },
        );
        cart.cartItems = [addedItem];
        return {
          ok: true,
          cart: {
            restaurant,
            cartItems: cart.cartItems,
            totalPrice: this.calculatePrice(cart.cartItems),
          },
        };
      }
      for (let i = 0; i < cart.cartItems.length; i++) {
        const curCartItem = cart.cartItems[i];
        if (curCartItem.dishId === dishId) {
          if (quantity > 0) {
            await this.cartItem.update({ id: curCartItem.id }, { quantity });
            cart.cartItems[i].quantity = quantity;
            return {
              ok: true,
              cart: {
                restaurant,
                cartItems: cart.cartItems,
                totalPrice: this.calculatePrice(cart.cartItems),
              },
            };
          } else {
            await this.cartItem.delete({ id: curCartItem.id });
            cart.cartItems.splice(i, 1);
            if (cart.cartItems.length === 0) {
              await this.cart.update(
                { id: cart.id },
                { restaurant: undefined },
              );
              cart.restaurant = undefined;
              cart.restaurantId = undefined;
            }
            return {
              ok: true,
              cart: {
                restaurant,
                cartItems: cart.cartItems,
                totalPrice:
                  cart.cartItems.length > 0
                    ? this.calculatePrice(cart.cartItems)
                    : 0,
              },
            };
          }
        }
      }
      // add item to cartItems
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }
}
