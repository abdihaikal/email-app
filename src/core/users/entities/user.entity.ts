import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Message } from '../../messages/entities/message.entity';

class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  first_name: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  middle_name?: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  last_name: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'Asia/Jakarta',
  })
  location?: string;

  @OneToMany(() => Message, (column) => column.user)
  messages: Message[];

  get full_name(): string {
    return [this.first_name, this.middle_name, this.last_name]
      .map((name) => (name ? name.trim() : null))
      .filter(Boolean)
      .join(' ');
  }
}

class UserEntityWithMessageType extends UserEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  birthday_date?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  anniversary_date?: string;
}

@Entity({ name: 'users' })
@Index(['email', 'location', 'birthday_date', 'anniversary_date'])
export class User extends UserEntityWithMessageType {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  get isDeleted(): boolean {
    return this.deleted_at !== null;
  }
}
