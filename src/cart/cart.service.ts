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
      price = price + cartItem[i].dish.price * cartItem[i].quantity;
    }
    return +price.toFixed(2);
  }
  async addToCart(
    user: User,
    { dishId, quantity }: AddToCartInput,
  ): Promise<AddToCartOutput> {
    try {
      if (user.role !== UserRole.RegularUser) return unauthorizedError();
      let cart = await this.cart.findOne(
        { user },
        { relations: ['restaurant'] },
      );
      if (!cart) {
        const createCartOutput = await this.createCart(user);
        if (createCartOutput.cart) {
          cart = createCartOutput.cart;
        } else {
          return internalServerError(
            'Sorry we cannot process your request at the moment! Please try again later!',
          );
        }
      }
      const { dish, error } = await this.restaurantsService.getDishById(user, {
        id: dishId,
      });
      if (!dish) {
        return {
          ok: false,
          error:
            error?.code === ERROR_NAMES.NOT_FOUND
              ? {
                  code: ERROR_NAMES.NOT_FOUND,
                  message:
                    "The meal you're trying to add has been deleted! Try something else?",
                }
              : error,
        };
      }
      if (dish.restaurantId !== cart.restaurantId) {
        await this.cartItem.delete({
          cart: {
            id: cart.id,
          },
        });
        if (quantity > 0) {
          const restaurant = await this.restaurantsService.getRestaurantById(
            dish.restaurantId,
          );
          const addedCartItem = await this.cartItem.save(
            this.cartItem.create({
              cart,
              dish,
              quantity,
            }),
          );
          await this.cart.update({ id: cart.id }, { restaurant });
          const cartItems = [addedCartItem];

          return {
            ok: true,
            cart: {
              restaurant,
              cartItems,
              totalPrice: this.calculatePrice(cartItems),
            },
          };
        }
        return {
          ok: true,
          cart: {
            restaurant: undefined,
            cartItems: [],
            totalPrice: 0,
          },
        };
      }
      const cartItems = await this.cartItem.find({
        where: {
          cart,
        },
        order: {
          createdAt: 'ASC',
        },
        relations: ['dish'],
      });
      if (cartItems.length > 0) {
        for (let i = 0; i < cartItems.length; i++) {
          if (cartItems[i].dishId === dishId) {
            if (quantity > 0) {
              // update item quantity
              await this.cartItem.update({ id: cartItems[i].id }, { quantity });
              cartItems[i].quantity = quantity;
              return {
                ok: true,
                cart: {
                  restaurant: cart.restaurant,
                  cartItems,
                  totalPrice: this.calculatePrice(cartItems),
                },
              };
            }
            // remove from cart
            await this.cartItem.delete({ id: cartItems[i].id });
            cartItems.splice(i, 1);
            return {
              ok: true,
              cart: {
                restaurant: cart.restaurant,
                cartItems,
                totalPrice: this.calculatePrice(cartItems),
              },
            };
          }
        }
      }

      // add new item to list
      if (quantity > 0) {
        const addedItem = await this.cartItem.save(
          this.cartItem.create({
            cart,
            dish,
            quantity,
          }),
        );

        cartItems.push(addedItem);
      }

      return {
        ok: true,
        cart: {
          restaurant: cart.restaurant,
          cartItems: cartItems,
          totalPrice: this.calculatePrice(cartItems),
        },
      };
    } catch (error) {
      console.log(error);
      return internalServerError();
    }
  }
}
