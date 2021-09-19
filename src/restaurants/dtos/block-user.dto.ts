import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class BlockUserInput {
  @Field(() => Int, { nullable: true })
  blockId: number;

  @Field(() => Int, { nullable: true })
  restaurantId: number;

  @Field(() => Boolean, { nullable: true })
  all: boolean;

  @Field(() => Boolean, { nullable: true })
  unblock: boolean;
}

@ObjectType()
export class BlockUserOutput extends CoreOutput {}
