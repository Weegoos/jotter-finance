import { Transform } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => {
    const val = Number(value);
    return !isNaN(val) && val > 0 ? val : 10; // default limit = 10
  })
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
  })
  limit?: number;

  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => {
    const val = Number(value);
    return !isNaN(val) && val > 0 ? val : 1; // default page = 1
  })
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    type: Number,
  })
  page?: number;
}
