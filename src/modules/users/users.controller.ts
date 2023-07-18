import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  BadRequestException,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';

import { AuthGuard } from '@/core/guards/auth.guard';
import { Serialize } from '@/core/interceptors/serialize.interceptor';
import { SocialService } from '@/modules/social/social.service';
import { FileUploadExceptionFilter } from '@/core/filters/file-upload-exception.filter';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';

import { OwnershipGuard } from './guards/ownership.guard';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as sharp from 'sharp';

@Controller('user')
@Serialize(UserDto)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly socialService: SocialService,
  ) {}

  // *********** //
  // upload file //
  // *********** //

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 1024 * 1024 * 2,
        files: 1,
      },
    }),
  )
  @UseFilters(FileUploadExceptionFilter)
  async uploadFile(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      await sharp(file.buffer).metadata();
    } catch (error) {
      throw new BadRequestException('Invalid file type');
    }

    if (user.profilePicture?.includes('uploads/')) {
      await this.usersService.deleteFile(user.profilePicture);
    }

    const filePath = await this.usersService.saveFile(file);
    await this.usersService.update(user.id, { profilePicture: filePath });

    return { status: 'success' };
  }

  // ****** //
  // whoAmI //
  // ****** //

  @Get('/me')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User): User {
    return user;
  }

  // *********** //
  // getAllUsers //
  // *********** //

  @Get('/all')
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users;
  }

  // ************ //
  // findUserById //
  // ************ //

  @Get('/:id')
  @UseGuards(AuthGuard)
  async findUserById(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // ********** //
  // updateUser //
  // ********** //

  @Patch('/:id')
  @UseGuards(AuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    return await this.usersService.update(id, body);
  }

  // ********** //
  // removeUser //
  // ********** //

  @Delete('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(OwnershipGuard)
  async removeUser(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }
}
