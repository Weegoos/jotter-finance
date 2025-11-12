import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBudgetDTO {
  @ApiPropertyOptional({
    description: 'ID категории бюджета',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiProperty({
    description: 'Сумма бюджета',
    example: 5000,
  })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Период бюджета (например, "2025-11")',
    example: '2025-11',
  })
  @IsString()
  period: string;

  @ApiProperty({
    description: 'Статус бюджета',
    example: 'active',
  })
  @IsString()
  status: string;
}
