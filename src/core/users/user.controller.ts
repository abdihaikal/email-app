import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { CustomParseUUIDPipe } from '../utils/custom-parse-uuid.pipe';
import { ParseEmailPipe } from '../utils/parse-email.pipe';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserService } from './user.service';

@Controller({ path: 'users' })
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.service.createUser(dto);
    return this.mapToResponseDto(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateUser(
    @Param('id', CustomParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.service.updateUser(id, dto);
    return this.mapToResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteUser(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.deleteUser(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserById(
    @Param('id', CustomParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    const user = await this.service.getUserById(id);
    return this.mapToResponseDto(user);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiParam({
    name: 'email',
    description: 'User email',
    type: 'string',
    format: 'email',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserByEmail(
    @Param('email', ParseEmailPipe) email: string,
  ): Promise<UserResponseDto> {
    const user = await this.service.getUserByEmail(email);
    return this.mapToResponseDto(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.service.getUsers();
    return users.map((user) => this.mapToResponseDto(user));
  }

  private mapToResponseDto(user: User): UserResponseDto {
    user = this.service.repository.create(user);
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      birthdayDate: user.birthday_date,
      anniversaryDate: user.anniversary_date,
      location: user.location,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
