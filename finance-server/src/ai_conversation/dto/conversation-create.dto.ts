import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAIConversationDto {
  @ApiProperty({ description: 'Title of the conversation' })
  @IsNotEmpty()
  @IsString()
  title: string;
}
