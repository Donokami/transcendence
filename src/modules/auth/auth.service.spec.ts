import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { type User } from '@/modules/users/user.entity';
import { UsersService } from '@/modules/users/users.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: async (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return await Promise.resolve(filteredUsers);
      },
      create: async (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as unknown as User;
        users.push(user);
        return await Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('Can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('Creates a new user with a salted and hashed password', async () => {
    const user = await service.register('user@test.com', 'password');

    expect(user.password).not.toEqual('password');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('Throws an error if user signs up with email that is in use', async () => {
    await service.register('knownUser@test.com', 'pass');
    await expect(
      service.register('knownUser@test.com', 'pass'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Throws an error if signIn() is called with an unused email', async () => {
    await expect(service.signIn('dumb@test.com', 'pass')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Throws an error if an invalid password is provided', async () => {
    await service.register('user@test.com', 'password');
    await expect(
      service.signIn('user@test.com', 'wrongPassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('Returns a user if correct password is provided', async () => {
    await service.register('user@test.com', 'password');

    const user = service.signIn('user@test.com', 'password');
    expect(user).toBeDefined();
  });
});
