import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsResolver } from './restaurants.resolver';

describe('RestaurantsResolver', () => {
  let resolver: RestaurantsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RestaurantsResolver],
    }).compile();

    resolver = module.get<RestaurantsResolver>(RestaurantsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
