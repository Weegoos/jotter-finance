import { ApiProperty } from '@nestjs/swagger';

export class AccountStatusUpdate {
  @ApiProperty({
    example: 'true',
    description: 'The status of the account',
  })
  active: boolean;
}
