import { Module } from '@nestjs/common';
import { ServerResolver } from './server.resolver';

@Module({
  providers: [ServerResolver]
})
export class ServerModule {}
