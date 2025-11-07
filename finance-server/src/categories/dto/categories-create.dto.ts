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
    description: 'The type of the category',
    enum: CategoryType,
    example: CategoryType.INCOME,
  })
  @IsEnum(CategoryType)
  @IsNotEmpty()
  type: CategoryType;
}
