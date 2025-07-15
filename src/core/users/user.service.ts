import { Not, Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { getLuxonTimezone } from '../../utils/luxon-date';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) readonly repository: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const oldUser = await this.repository.findOne({
      where: { email: dto.email },
      withDeleted: true,
    });
    if (oldUser) {
      throw new ConflictException(`User with this email already exists`);
    }
    if (!dto.location) {
      dto.location = getLuxonTimezone();
    }

    const newUser = await this.repository.save(dto);
    await this.eventEmitter.emitAsync('user.created', newUser);
    return newUser;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const oldUser = await this.repository.findOneBy({ id });
    if (!oldUser) {
      throw new NotFoundException(`User not found`);
    }
    if (dto.email && dto.email !== oldUser.email) {
      const otherOldUser = await this.repository.findOneBy({
        id: Not(id),
        email: dto.email,
      });
      if (otherOldUser) {
        throw new ConflictException(
          `User with email ${dto.email} already exists`,
        );
      }
    }

    const newDto = this.repository.merge(oldUser, dto);
    const newUser = await this.repository.save(newDto);
    await this.eventEmitter.emitAsync('user.updated', newUser, oldUser);
    return newUser;
  }

  async deleteUser(id: string): Promise<void> {
    const oldUser = await this.repository.findOneBy({ id });
    if (!oldUser) {
      throw new NotFoundException(`User not found`);
    }

    await this.repository.softDelete(id);
    await this.eventEmitter.emitAsync('user.deleted', id);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.repository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    if (!email && !email.length) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.repository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await this.repository.find();
  }
}
