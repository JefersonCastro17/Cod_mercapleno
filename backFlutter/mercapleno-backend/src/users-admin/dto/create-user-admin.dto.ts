import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserAdminDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsString()
  direccion: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsDateString()
  fecha_nacimiento: string;

  @ApiProperty()
  @IsInt()
  id_rol: number;

  @ApiProperty()
  @IsInt()
  id_tipo_identificacion: number;

  @ApiProperty({ description: 'Número de identificación (solo números)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'El número de identificación debe contener solo dígitos' })
  numero_identificacion: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  email_verified?: boolean;
}
