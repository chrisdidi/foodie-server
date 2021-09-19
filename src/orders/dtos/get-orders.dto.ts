import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { OrderStatusStatus } from '../entities/order-status-history.entity';
import { Order } from '../entities/order.entity';

@InputType()
export class GetOrdersInput extends PartialType(PickType(Restaurant, ['id'])) {}

@ObjectType()
export class OrderWithStatus extends Order {
  @Field(() => OrderStatusStatus)
  status: OrderStatusStatus;

  @Field(() => Boolean)
  userBlocked: boolean;
}
@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(() => [OrderWithStatus], { nullable: true })
  orders?: OrderWithStatus[];

  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant;
}
