import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return {
      ok: true,
    };
  }
}
