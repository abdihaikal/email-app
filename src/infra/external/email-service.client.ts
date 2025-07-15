import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class EmailRequestPayload {
  email: string;
  subject: string;
  message: string;
}

@Injectable()
export class EmailServiceClient {
  private readonly logger = new Logger(EmailServiceClient.name);
  private readonly httpClient: AxiosInstance;
  private readonly httpEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    const baseURL = configService.get<string>('EMAIL_SERVICE_BASE_URL');
    if (!baseURL) {
      throw new InternalServerErrorException(
        'Email service Base URL is not configured',
      );
    }
    const endpoint = configService.get<string>('EMAIL_SERVICE_ENDPOINT');
    if (!endpoint) {
      throw new InternalServerErrorException(
        'Email service endpoint is not configured',
      );
    }

    this.httpEndpoint = endpoint;
    this.httpClient = axios.create({
      baseURL,
      timeout: configService.get<number>('EMAIL_SERVICE_TIMEOUT_MS', 5000),
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async send(
    payload: EmailRequestPayload,
  ): Promise<AxiosResponse<EmailRequestPayload, any>> {
    try {
      const response = await this.httpClient.post<EmailRequestPayload>(
        this.httpEndpoint,
        payload,
        {},
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status;
        const data = axiosError.response?.data;

        this.logger.error(
          `Failed to send message to ${payload.email}. ` +
            `Status: ${statusCode || 'N/A'}. ` +
            `Response Data: ${JSON.stringify(data || axiosError.message)}. ` +
            `Error Code: ${axiosError.code || 'N/A'}. ` +
            `Is Timeout: ${axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT'}.`,
        );

        if (
          (typeof statusCode === 'bigint' && statusCode >= 500) ||
          axiosError.code === 'ECONNABORTED' ||
          axiosError.code === 'ETIMEDOUT'
        ) {
          throw new BadGatewayException(
            `External email service unavailable or timed out for ${payload.email}.`,
          );
        } else if (typeof statusCode === 'bigint' && statusCode >= 400) {
          throw new InternalServerErrorException(
            `External email service returned client error for ${payload.email}: ${JSON.stringify(data)}`,
          );
        } else {
          throw new InternalServerErrorException(
            `An unexpected error occurred while calling email service for ${payload.email}: ${axiosError.message}`,
          );
        }
      }
      throw new InternalServerErrorException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `An unknown error occurred: ${error?.message}`,
      );
    }
  }
}
