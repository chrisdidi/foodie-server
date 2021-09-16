import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), RestaurantsModule],
  providers: [CartService, CartResolver],
})
export class CartModule {}
