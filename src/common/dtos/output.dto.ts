import { Field, ObjectType } from '@nestjs/graphql';
import { CoreError } from 'src/helpers/custom-error';

@ObjectType()
export class CoreOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => CoreError, { nullable: true })
  error?: CoreError;
}
