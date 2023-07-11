import { Test, type TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { type User } from './user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: async (id: string) => {
        return await Promise.resolve({
          id,
          email: 'user@test.fr',
          password: 'password',
        } as User);
      },
      find: async (email: string) => {
        return await Promise.resolve([
          {
            id: 1,
            email,
            password: 'password',
          } as User,
        ]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // register: () => {},
      signIn: async (email: string, password: string) => {
        return await Promise.resolve({
          id: 1,
          email,
          password,
        } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: fakeUsersService },
        { provide: AuthService, useValue: fakeAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findUser returns a single user with a given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with a given id is not found', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('findAllUsers returns a list of users with a given email', async () => {
    const users = await controller.findAllUsers('user@test.fr');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('user@test.fr');
  });

  it('SignIn updates session object and returns user', async () => {
    const session = { userId: -10 };
    const user = await controller.signIn(
      { email: 'user@test.com', password: 'password' },
      session,
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
