import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Order } from '../entities/order.entity';
import { OrderWithStatus } from './get-orders.dto';

@InputType()
export class GetOrderInput extends PickType(Order, ['id']) {
  @Field(() => Int, { nullable: true })
  restaurantId?: number;
}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(() => OrderWithStatus, { nullable: true })
  order?: OrderWithStatus;
}
