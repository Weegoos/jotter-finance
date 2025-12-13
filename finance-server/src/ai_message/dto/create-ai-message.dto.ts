import { ApiProperty } from '@nestjs/swagger';
import type { AIMessageRole } from '../interface/ai_message.interface';

export class CreateAIMessageDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'AI conversation ID',
  })
  conversationId: string;

  @ApiProperty({
    example: 'user',
    description: 'Role of the message sender',
    enum: ['user', 'assistant', 'system'],
  })
  role: AIMessageRole;

  @ApiProperty({
    example: 'Hello, can you help me?',
    description: 'Message content',
  })
  content: string;
}
