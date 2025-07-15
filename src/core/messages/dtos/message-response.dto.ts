export class MessageResponseDto {
  id: string;
  userID: string;
  messageType: string;
  messageSubject: string;
  messageContent?: string;
  messageScheduleDate?: string;
  messageStatus: string;
  lastAttemptAt?: Date;
  retriesAttempted: number;
  createdAt: Date;
  updatedAt: Date;
}
