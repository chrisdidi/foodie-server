import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Order } from './order.entity';

@InputType('OrderItemsInput', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column()
  description?: string;

  @Field(() => Float)
  @Column('decimal')
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  photo?: string;

  @Field(() => Number)
  @Column({ default: 1 })
  quantity: number;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.items, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  order?: Order;

  @RelationId((orderItem: OrderItem) => orderItem.order)
  orderId?: number;

  @Field(() => Dish, { nullable: true })
  @ManyToOne(() => Dish, (dish) => dish.orderedItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  dish?: Dish;

  @RelationId((orderItem: OrderItem) => orderItem.dish)
  dishId: number;
}
