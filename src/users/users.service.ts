import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_NAMES } from 'src/helpers/http-codes';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async createAccount({
    email,
    name,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      // input validation
      if (!email || !password || !name) {
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.BAD_REQUEST,
            message: `${email ? 'Password' : 'E-mail'} is required!`,
          },
        };
      }
      if (password.length < 8)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.BAD_REQUEST,
            message: 'Password requires minimum 8 characters.',
          },
        };

      email = email.toLowerCase();
      // check if email exists in database
      const exists = await this.users.findOne({ email });
      if (exists)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.UNPROCESSABLE_ENTITY,
            message: 'This is a registered e-mail!',
          },
        };

      const user = await this.users.save(
        this.users.create({ email, name, password }),
      );

      // sign JWT token
      // then return jwt token
      return {
        ok: true,
        accessToken: 'abcd123',
      };
    } catch (error) {
      // log error with Sentry
      console.log(error);
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: 'Please try again later.',
        },
      };
    }
  }
}
