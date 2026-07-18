import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsString()
  apellido: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 12,
    description: 'Contraseña segura: mínimo 12 caracteres, con mayúsculas, minúsculas, números y caracteres especiales',
    example: 'SecurePass123!'
  })
  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @Matches(/^(?=.*[a-z])/, { message: 'La contraseña debe contener al menos una letra minúscula' })
  @Matches(/^(?=.*[A-Z])/, { message: 'La contraseña debe contener al menos una letra mayúscula' })
  @Matches(/^(?=.*\d)/, { message: 'La contraseña debe contener al menos un número' })
  @Matches(/^(?=.*[@$!%*?&])/, { message: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)' })
  password: string;

  @ApiProperty()
  @IsString()
  direccion: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsDateString()
  fecha_nacimiento: string;

  @ApiProperty({ required: false, default: 3 })
  @IsOptional()
  @IsInt()
  id_rol?: number = 3;

  @ApiProperty()
  @IsInt()
  id_tipo_identificacion: number;

  @ApiProperty({ description: 'Número de identificación (solo números)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'El número de identificación debe contener solo dígitos' })
  numero_identificacion: string;
}
