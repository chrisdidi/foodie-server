import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class MyRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class RestaurantDetails extends Restaurant {
  @Field(() => Boolean)
  hasIncompleteOrders: boolean;
}

@ObjectType()
export class MyRestaurantOutput extends CoreOutput {
  @Field(() => RestaurantDetails, { nullable: true })
  restaurant?: RestaurantDetails;
}
