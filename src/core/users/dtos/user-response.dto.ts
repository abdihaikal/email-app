export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthdayDate?: string;
  anniversaryDate?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}
