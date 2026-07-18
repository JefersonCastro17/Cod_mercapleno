import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class RegisterMovementDto {
  @ApiProperty()
  @IsInt()
  id_producto: number;

  @ApiProperty({ enum: ['ENTRADA', 'SALIDA'] })
  @IsString()
  @IsIn(['ENTRADA', 'SALIDA'])
  tipo_movimiento: 'ENTRADA' | 'SALIDA';

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ description: 'ID de documento (ej: CC, RUC, 01, 02)' })
  @IsString()
  @MaxLength(5)
  @Matches(/^[A-Z0-9]+$/, { message: 'El ID de documento solo puede contener letras mayúsculas y números' })
  id_documento: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  comentario?: string;
}
