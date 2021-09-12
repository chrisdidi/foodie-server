import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { CoreOutput } from 'src/common/dtos/output.dto';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return await this.usersService.createAccount(input);
  }

  @Mutation(() => SignInOutput)
  async signIn(@Args('input') input: SignInInput): Promise<SignInOutput> {
    return this.usersService.signIn(input);
  }

  @Query(() => User, { nullable: true })
  @Role(['Any'])
  me(@AuthUser() authUser?: User) {
    return authUser;
  }

  @Mutation(() => CoreOutput)
  @Role(['Any'])
  async switchToRestaurantOwner(@AuthUser() authUser: User) {
    return this.usersService.switchToRestaurantOwner(authUser.id);
  }
}
