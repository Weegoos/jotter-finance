import { ApiProperty } from '@nestjs/swagger';

export class AccountDTO {
  @ApiProperty({
    example: 'Cash',
    description: 'The name of the account',
  })
  name: string;

  @ApiProperty({
    example: 1000,
    description: 'The balance of the account',
  })
  balance: number;

  @ApiProperty({
    example: 'USD',
    description: 'The currency of the account',
  })
  currency: string;

  @ApiProperty({
    example: 'savings',
    description: 'The type of the account',
  })
  type: string;

  @ApiProperty({
    example: 'true',
    description: 'The status of the account',
  })
  active: boolean;
}
