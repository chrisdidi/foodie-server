import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { OrderStatusHistory } from '../entities/order-status-history.entity';
import { Order } from '../entities/order.entity';

@InputType()
export class UpdateOrderStatusInput extends PickType(Order, ['id']) {}

@ObjectType()
export class UpdateOrderStatusOutput extends CoreOutput {
  @Field(() => OrderStatusHistory, { nullable: true })
  status?: OrderStatusHistory;
}
