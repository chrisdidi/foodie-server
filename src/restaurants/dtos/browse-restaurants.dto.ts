import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurants.entity';

@InputType()
export class BrowseRestaurantsInput {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Int, { defaultValue: 1 })
  offset: number;

  @Field(() => Int, { defaultValue: 1 })
  limit: number;
}

@ObjectType()
export class BrowseRestaurantsOutput extends CoreOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];
}
