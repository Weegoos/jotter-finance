import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryType } from '../categories.model';

export class CreateCategoryDTO {
  @ApiProperty({
    example: 'Food',
    description: 'The name of the category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'income',
    description: 'The type of the category: income or expense',
    enum: CategoryType,
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
