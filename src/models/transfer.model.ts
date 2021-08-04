import {Entity, model, property} from '@loopback/repository';

export enum transfer_status{
  PENDING = "Pending",
  COMPLETED = "Completed",
  FAILED = "Failed"
}

@model()
export class Transfer extends Entity {
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
  senderId: string;

  @property({
    type: 'string',
    required: true,
  })
  recipientId: string;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: true,
  })
  sourceAcctId?: string;

  @property({
    type: 'string',
    required: true,
  })
  destAcctId?: string;

  @property({
    type: 'date',
  })
  txnDate?: string;

  @property({
    type: 'string',
  })
  status?: transfer_status;


  constructor(data?: Partial<Transfer>) {
    super(data);
  }
}

export interface TransferRelations {
  // describe navigational properties here
}

export type TransferWithRelations = Transfer & TransferRelations;
