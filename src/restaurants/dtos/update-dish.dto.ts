import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@InputType()
export class UpdateDishInput extends PartialType(
  PickType(Dish, ['description', 'id', 'photo', 'price', 'name']),
) {}

@ObjectType()
export class UpdateDishOutput extends CoreOutput {
  @Field(() => Dish, { nullable: true })
  dish?: Dish;
}
