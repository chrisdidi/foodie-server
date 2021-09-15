import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class UpdateRestaurantInput extends PartialType(
  PickType(Restaurant, ['name', 'description', 'backgroundImage']),
) {
  @Field(() => Int)
  id: number;
}

@ObjectType()
export class UpdateRestaurantOutput extends CoreOutput {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
