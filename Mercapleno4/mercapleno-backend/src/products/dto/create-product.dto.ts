import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty()
  @IsNumber()
  precio: number;

  @ApiProperty()
  @IsInt()
  id_categoria: number;

  @ApiProperty()
  @IsInt()
  id_proveedor: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ default: 'Disponible' })
  @IsString()
  estado: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imagen?: string;
}
