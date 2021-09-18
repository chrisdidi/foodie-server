import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Order } from './order.entity';

export enum OrderStatusStatus {
  Placed = 'Placed',
  Canceled = 'Canceled',
  Processing = 'Processing',
  In_Route = 'In_Route',
  Delivered = 'Delivered',
  Received = 'Received',
}

registerEnumType(OrderStatusStatus, { name: 'OrderStatusStatus' });

@InputType('OrderStatusHistory', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderStatusHistory extends CoreEntity {
  @Column({ type: 'enum', enum: OrderStatusStatus })
  @Field(() => OrderStatusStatus)
  @IsEnum(OrderStatusStatus)
  status: OrderStatusStatus;

  @Field(() => Order)
  @ManyToOne(() => Order, (order) => order.statusHistory, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @RelationId(
    (orderStatusHistory: OrderStatusHistory) => orderStatusHistory.order,
  )
  orderId?: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.statusHistory, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: User;

  @RelationId(
    (orderStatusHistory: OrderStatusHistory) => orderStatusHistory.user,
  )
  userId?: number;
}
