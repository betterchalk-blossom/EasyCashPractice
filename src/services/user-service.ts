import { repository } from "@loopback/repository";
import { User } from "../models";
import { TransferRepository, UserRepository } from "../repositories";

export class UserService{
    constructor(
        @repository(UserRepository)
        private userRepo: UserRepository,
        @repository(TransferRepository)
        private transferRepo: TransferRepository
    ){}

    async createUser(user: User){
        return this.userRepo.create(user);
    }

    async updateCashBalance(id: string, user: User){
        const user_id = await this.userRepo.findById(id);
        user_id.balance = user_id.balance + user.balance;
        console.log(user_id, "omo");
        return this.userRepo.updateById(id, user_id);
    }
}