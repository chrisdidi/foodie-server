import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Cart } from 'src/cart/entities/cart.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Dish } from './dish.entity';

export interface KeywordsType {
  [key: string]: number;
}

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  description: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  backgroundImage?: string;

  @Field(() => Number)
  @Column({ default: 0 })
  orderCounts: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants, {
    onDelete: 'CASCADE',
  })
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  dishes: Dish[];

  @Column({ type: 'jsonb', array: false, default: '{}', nullable: true })
  keywords: KeywordsType;

  @Field(() => [Cart])
  @OneToMany(() => Cart, (cart) => cart.restaurant)
  carts: Cart[];
}
