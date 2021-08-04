import {Entity, model, property} from '@loopback/repository';
import { Account } from './account.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property.array(Account)
  accounts: Account[];

  @property({
    type: 'number',
    default: 0,
  })
  balance: number;


  constructor(data?: Partial<User>) {
    super(data);
  }

}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
