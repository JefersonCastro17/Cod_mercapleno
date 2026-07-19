import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsInt, IsOptional, IsString, Matches, MinLength, IsNotEmpty,isBoolean } from 'class-validator';

export class CreateUserAdminDto {
  @ApiProperty()
  @IsNotEmpty({message:'el nombre es obligatorio'})
  @IsString({message:'el nombre debe ser texto'})
   @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {message:'El nombre solo puede contener letras'})
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({message:'El campo apellido es obligatorio'})
  @IsString({message:'el apellido debe ser texto'})
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {message:'El apellido solo puede contener letras'})
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
