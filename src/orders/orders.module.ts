import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from 'src/cart/cart.module';
import { RestaurantsModule } from 'src/restaurants/restaurants.module';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory]),
    RestaurantsModule,
    CartModule,
  ],
  providers: [OrdersService, OrdersResolver],
})
export class OrdersModule {}
