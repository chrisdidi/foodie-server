import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entity';

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => Float)
  @Column('decimal')
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  photo?: string;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.dishes, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => [CartItem])
  @OneToMany(() => CartItem, (cartItem) => cartItem.dish)
  cartItems: CartItem[];
}
