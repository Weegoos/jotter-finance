import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
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
}
