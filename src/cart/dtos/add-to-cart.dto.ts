import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { CartOutput } from './my-cart.dto';

@InputType()
export class AddToCartInput {
  @Field(() => Int)
  dishId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Boolean, { nullable: true })
  add?: boolean;
}

@ObjectType()
export class AddToCartOutput extends CoreOutput {
  @Field(() => CartOutput, { nullable: true })
  cart?: CartOutput;
}
