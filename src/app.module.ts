import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    ServerModule,
  ],
})
export class AppModule {}
