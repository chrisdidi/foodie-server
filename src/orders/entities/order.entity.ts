import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

export enum OrderStatus {
  Placed = 'Placed',
  Canceled = 'Canceled',
  Processing = 'Processing',
  In_Route = 'In_Route',
  Delivered = 'Delivered',
  Received = 'Received',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });
@InputType('OrdersInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.Placed })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  @Column('decimal')
  @IsNumber()
  price: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  restaurant?: Restaurant;

  @RelationId((order: Order) => order.restaurant)
  restaurantId?: number;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: User;

  @RelationId((order: Order) => order.user)
  userId?: number;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @Field(() => [OrderStatusHistory])
  @OneToMany(
    () => OrderStatusHistory,
    (orderStatusHistory) => orderStatusHistory.order,
  )
  statusHistory: OrderStatusHistory[];
}
