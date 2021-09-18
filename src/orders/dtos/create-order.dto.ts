import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ObjectType()
export class CreateOrderOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  orderId?: number;
}
