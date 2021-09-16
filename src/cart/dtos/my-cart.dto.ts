import { Field, Float, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { CartItem } from '../entities/cart-item.entity';

@ObjectType()
export class CartOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => [CartItem], { nullable: true })
  cartItems?: CartItem[];

  @Field(() => Float)
  totalPrice: number;
}

@ObjectType()
export class MyCartOutput extends CoreOutput {
  @Field(() => CartOutput, { nullable: true })
  cart?: CartOutput;
}
