import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyLoginCodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pendingToken: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
