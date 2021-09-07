import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class ServerResolver {
  @Query((returns) => Boolean)
  serverStatus(): boolean {
    return true;
  }
}
