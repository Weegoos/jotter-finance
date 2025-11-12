import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateBudgetDTO {
  @ApiProperty({
    description: 'ID категории бюджета',
    example: 1,
  })
  @IsInt()
  category_id: number; // теперь обязательное поле

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
