import { Field } from '@nestjs/graphql';

export class CoreError {
  @Field(() => String)
  code: string;

  @Field(() => String)
  message: string;
}
