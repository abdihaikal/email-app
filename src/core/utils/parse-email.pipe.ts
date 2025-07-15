import { BadRequestException, PipeTransform } from '@nestjs/common';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ParseEmailPipe implements PipeTransform<string> {
  transform(value: string) {
    if (!value) {
      throw new BadRequestException('Email is required.');
    }

    if (!emailRegex.test(value)) {
      throw new BadRequestException('Invalid email format.');
    }

    return value.toLowerCase();
  }
}
