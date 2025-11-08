import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';
import { TransactionType } from '../transaction.model';

export class CreateTransactionDTO {
  @ApiProperty({
    example: 1,
    description: 'The account ID for this transaction',
  })
  @IsNumber()
  @IsNotEmpty()
  accountId: number;

  @ApiProperty({
    example: 3,
    description: 'The category ID for this transaction (optional)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({
    example: 1500,
    description: 'The amount of the transaction',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: TransactionType.INCOME,
    description: 'The type of the transaction',
    enum: TransactionType,
  })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({
    example: 'Salary for November',
    description: 'Description of the transaction',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2025-11-08',
    description: 'The date of the transaction (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Repeat rule for recurring transaction (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  repeat_rule?: string;
}
