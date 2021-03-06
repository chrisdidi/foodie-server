import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'name',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  accessToken?: string;
}
