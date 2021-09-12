import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class AddDishInput extends PickType(Dish, [
  'description',
  'price',
  'name',
]) {
  @Field(() => Int)
  restaurantId: number;
}

@ObjectType()
export class AddDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  dish?: Dish;
}
