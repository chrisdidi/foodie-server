import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { CartItem } from '../entities/cart-item.entity';

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => Int)
  quantity: number;
}

@ObjectType()
class CartOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;

  @Field(() => [CartItem], { nullable: true })
  cartItems?: CartItem[];

  @Field(() => Float)
  totalPrice: number;
}
@ObjectType()
export class AddToCartOutput extends CoreOutput {
  @Field(() => CartOutput)
  cart?: CartOutput;
}
