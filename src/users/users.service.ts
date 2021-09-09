import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { INTERNAL_SERVER_ERROR_MESSAGE } from 'src/common/common.constants';
import { ERROR_NAMES } from 'src/helpers/http-codes';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { SignInInput, SignInOutput } from './dtos/sign-in.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
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
      const accessToken = this.jwtService.sign(user.id);

      // then return jwt token
      return {
        ok: true,
        accessToken,
      };
    } catch (error) {
      // log error with Sentry
      console.log(error);
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: INTERNAL_SERVER_ERROR_MESSAGE,
        },
      };
    }
  }

  async signIn({ email, password }: SignInInput): Promise<SignInOutput> {
    try {
      if (!email || !password)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.BAD_REQUEST,
            message: `Please enter your ${email ? 'password' : 'e-mail'}.`,
          },
        };

      email = email.toLowerCase();
      const user = await this.users.findOne({ email });
      if (!user)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.NOT_FOUND,
            message:
              'This e-mail is not registered! Please create account and try again.',
          },
        };

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect)
        return {
          ok: false,
          error: {
            code: ERROR_NAMES.FORBIDDEN,
            message: 'Password incorrect!',
          },
        };

      const accessToken = this.jwtService.sign(user.id);
      return {
        ok: true,
        accessToken,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error: {
          code: ERROR_NAMES.INTERNAL_SERVER_ERROR,
          message: INTERNAL_SERVER_ERROR_MESSAGE,
        },
      };
    }
  }
}
