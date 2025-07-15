import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  MaxLength,
  MinLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

class CreateUserBaseDto {
  @ApiProperty({
    description: 'User email address',
    example: 'abdihaikal@email.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Abdi',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    description: 'User middle name',
    example: '',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  middle_name?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Haikal',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  last_name: string;

  @ApiProperty({
    description: 'User timezone (IANA Time Zone Database identifier)',
    example: 'Asia/Jakarta',
    minLength: 5,
    maxLength: 100,
    required: false,
    default: 'Asia/Jakarta',
  })
  @IsTimeZone()
  @IsOptional()
  location?: string;
}

class CreateUserWithMessageTypeDto extends CreateUserBaseDto {
  @ApiProperty({
    description: 'User birthday in YYYY-MM-DD format',
    example: '1980-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  birthday_date?: string;

  @ApiProperty({
    description: 'User anniversary in YYYY-MM-DD format',
    example: '2025-01-01',
    required: false,
  })
  @IsString()
  @IsOptional()
  anniversary_date?: string;
}

export class CreateUserDto extends CreateUserWithMessageTypeDto {}
