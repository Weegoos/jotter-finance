import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectType } from 'src/project/ai_project.model';

export class CreateAIProjectDto {
  @ApiProperty({ description: 'Title of the project' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Type of the project', enum: ProjectType })
  @IsNotEmpty()
  @IsEnum(ProjectType)
  type: ProjectType;

  @ApiPropertyOptional({
    description: 'Optional description of the project',
    example: 'My finance tracking project',
  })
  @IsOptional()
  @IsString()
  description?: string | null;
}
