import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export type MessageStatus = 'pending' | 'processing' | 'sent' | 'failed';

class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    nullable: false,
  })
  user_id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  subject: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  schedule_date?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'pending',
  })
  status: MessageStatus;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  last_attempt_at?: Date;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  retries_attempted: number;

  @ManyToOne(() => User, (column) => column.messages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  resetState(): void {
    this.status = 'pending';
    this.last_attempt_at = undefined;
    this.retries_attempted = 0;
  }
}

export type ManualMessageType = 'regular';

export const manualMessageTypes: ManualMessageType[] = ['regular'];

export type AutomateMessageType = 'birthday' | 'anniversary';

export type MessageType = ManualMessageType | AutomateMessageType;

class MessageEntityWithType extends MessageEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    default: 'regular',
  })
  type: MessageType;

  get isTypeRegular(): boolean {
    return this.type === 'regular';
  }

  get isTypeBirthday(): boolean {
    return this.type === 'birthday';
  }

  get isTypeAnniversary(): boolean {
    return this.type === 'anniversary';
  }
}

@Entity({ name: 'messages' })
export class Message extends MessageEntityWithType {
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
