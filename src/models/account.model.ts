import {Entity, model, property} from '@loopback/repository';

enum acc_type {
  Bank = "Bank",
  Cash = "Cash",
  CreditCard = "Credit Card"
}

@model()
class BankInfo{
  @property()
  bankName: string

  @property()
  accountNum: string
}

@model()
export class Account extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    required: true,
  })
  account_type: acc_type;

  @property()
  bankInfo: BankInfo;


  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // describe navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
