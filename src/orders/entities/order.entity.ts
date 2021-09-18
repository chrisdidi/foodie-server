import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@InputType('OrdersInput', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => String)
  @Column()
  deliveryAddress: string;

  @Field(() => String)
  @Column()
  phoneNo: string;

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

  @Field(() => Boolean, { defaultValue: true })
  @Column({ default: true })
  userSeen?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @Column({ default: false })
  restaurantSeen?: boolean;
}
