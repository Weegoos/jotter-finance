import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateAIConversationDto {
  @ApiProperty({ description: 'Title of the conversation' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Project ID (optional)',
    nullable: true,
    example: 'null',
  })
  @IsOptional()
  @IsUUID()
  project_id?: string | null;
}
