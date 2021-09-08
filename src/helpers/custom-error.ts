import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreError {
  @Field(() => String)
  code: string;

  @Field(() => String)
  message: string;
}
