import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Cart } from '../entities/cart.entity';

@ObjectType()
export class CreateCartOutput extends CoreOutput {
  @Field(() => Cart, { nullable: true })
  cart?: Cart;
}
