import {repository} from "@loopback/repository";
import {response} from "@loopback/rest";
import {Account, Transfer, transfer_status, User} from "../models";
import {TransferRepository, UserRepository} from "../repositories";

export class UserService {
    constructor(
        @repository(UserRepository)
        private userRepo: UserRepository,
        @repository(TransferRepository)
        private transferRepo: TransferRepository
    ) { }

    async createUser(user: User) {
        return this.userRepo.create(user);
    }

    async updateCashBalance(id: string, user: User) {
        const user_id = await this.userRepo.findById(id);
        user.balance = user_id.balance + user.balance;
        console.log(user_id, "omo");
        return this.userRepo.updateById(id, user);
    }

    async transferMoney(transfer: Transfer) {
        const senderUser = await this.userRepo.findById(transfer.senderId);
        const recipientUser = await this.userRepo.findById(transfer.recipientId);

        if (senderUser.balance >= transfer.amount) {
            senderUser.balance = senderUser.balance - transfer.amount;
            recipientUser.balance = recipientUser.balance + transfer.amount;
            this.userRepo.updateById(transfer.senderId, senderUser);
            this.userRepo.updateById(transfer.recipientId, recipientUser);
            transfer.txnDate = new Date().toISOString()
            transfer.status = transfer_status.COMPLETED;
            return this.transferRepo.create(transfer)
        } else {
            throw 'Insufficient Balance';
        }
    }
}

// transfer.senderId,
// transfer.recipientId,
// transfer.amount,
// transfer.sourceAcctId,
// transfer.destAcctId,
// transfer.txnDate
// transfer.status
