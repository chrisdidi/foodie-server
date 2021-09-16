import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Cart } from './cart.entity';

@InputType('CartItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class CartItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, (dish) => dish.cartItems, {
    onDelete: 'CASCADE',
  })
  dish: Dish;

  @RelationId((cartItem: CartItem) => cartItem.dish)
  dishId: number;

  @Field(() => Number)
  @Column({ default: 1 })
  quantity: number;

  @Field(() => Cart)
  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;

  @RelationId((cartItem: CartItem) => cartItem.cart)
  cartId: number;
}
