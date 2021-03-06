import * as express from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  requestParam,
  requestBody,
} from 'inversify-express-utils';

import { BadRequestError, NotAuthorizedError } from '../../helpers';
import { IUser } from '../../entities';
import { BaseHttpController } from '../utils';
import { authTokens, IAuthService } from '../auth';
import { usersTokens } from './users.tokens';
import { IUsersService } from './users.service';

@controller('/users')
export class UsersController extends BaseHttpController {
  @inject(authTokens.AuthService) private readonly authService: IAuthService;
  @inject(usersTokens.UsersService) private readonly usersService: IUsersService;

  @httpPost('/login')
  public async login(@requestBody('googleAccessToken') token: string) {
    const { email } = await this.authService.verifyGoogleAccessToken(token);
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new NotAuthorizedError('You are not whitelisted');
    }
    const userToken = this.authService.encodeUser(user);
    return { token: userToken };
  }

  @httpGet('/')
  public async getUsers(): Promise<IUser[]> {
    await this.user.isInRole('root');
    return this.usersService.getUsers();
  }

  @httpPost('/')
  public async createUser(): Promise<IUser> {
    await this.user.isInRole('root');
    const user = this.request.body;
    return this.usersService.createUser(user);
  }

  @httpPut('/:userId')
  public async updateUser(): Promise<IUser> {
    await this.user.isInRole('root');
    const user: IUser = this.request.body;
    if (this.user.details.userId == user.userId) {
      throw new BadRequestError('You cannot edit your own privileges');
    }
    return this.usersService.updateUser(user);
  }

  @httpDelete('/:userId')
  public async deleteUser(@requestParam('userId') userId: number): Promise<void> {
    await this.user.isInRole('root');
    if (this.user.details.userId == userId) {
      throw new BadRequestError('You cannot delete yourself');
    }
    return this.usersService.deleteUser(userId);
  }
}
