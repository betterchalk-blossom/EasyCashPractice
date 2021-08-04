import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Transfer, TransferRelations} from '../models';

export class TransferRepository extends DefaultCrudRepository<
  Transfer,
  typeof Transfer.prototype.id,
  TransferRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Transfer, dataSource);
  }
}
