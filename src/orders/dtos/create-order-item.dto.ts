import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { OrderItem } from '../entities/order-item.entity';

@ObjectType()
export class CreateOrderItemOutput extends CoreOutput {
  @Field(() => OrderItem, { nullable: true })
  orderItem?: OrderItem;
}
