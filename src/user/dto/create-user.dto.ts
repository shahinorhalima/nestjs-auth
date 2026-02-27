import { IsString, isString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  email: string;
  password: string;
  phone: string;
}
