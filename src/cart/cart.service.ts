import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { internalServerError } from 'src/helpers/http-codes';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cart: Repository<Cart>,
  ) {}
  async createCart(user: User) {
    try {
      const cart = await this.cart.save(this.cart.create({ user }));
      return {
        ok: true,
        cart,
      };
    } catch (error) {
      return internalServerError();
    }
  }
}
