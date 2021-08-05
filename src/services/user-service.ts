import {TokenService} from '@loopback/authentication';
import {MyUserService, TokenServiceBindings, UserServiceBindings, UserRepository, User} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from "@loopback/repository";
import {HttpErrors} from '@loopback/rest';
import {Login, Transfer, transfer_status} from "../models";
import {TransferRepository} from "../repositories";
const bcrypt = require("bcrypt");

const IfUserExistsError = 'Email already in use';
const invalidLoginDetails = 'Invalid email or password'

export class UserService {
    constructor(
        @repository(UserRepository)
        private userRepo: UserRepository,
        @repository(TransferRepository)
        private transferRepo: TransferRepository,
        @inject(UserServiceBindings.USER_SERVICE)
        public userService: MyUserService,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: TokenService
    ) { }

    async createUser(user: User) {
        return this.userRepo.create(user);
    }

    async signup(user: Omit<User, 'id'>) {
        const userExists = await this.userRepo.findOne({
            where: {email: user.email.toLowerCase()}
        });

        if (userExists) {
            throw new HttpErrors.Conflict(IfUserExistsError);
        }

        user.password = await bcrypt.hash(user.password, await bcrypt.genSalt())
        let savedUser = await this.userRepo.create(user);
        let x = await this.userRepo.userCredentials(savedUser.id).create({password: user.password})
        return savedUser;
    }

    async updateCashBalance(id: string, user: User) {
        const user_id = await this.userRepo.findById(id);

        if(user.balance === undefined || null){
            user.balance = 0;
        }

        user.balance = user_id.balance + user.balance;
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
            transfer.status = transfer_status.FAILED;
            throw new HttpErrors.Unauthorized('Insufficient Balance');
        }
    }
    async verifyCredentials(login: Login) {
        const foundUser = await this.userRepo.findOne({
            where: {email: login.email.toLowerCase().trim()}
        })

        if (!foundUser) {
            throw new HttpErrors.Unauthorized(invalidLoginDetails);
        }

        const checkPassword = await this.verifyPassword(foundUser.password, login.password)

        if (!checkPassword) {
            throw new HttpErrors.Unauthorized(invalidLoginDetails)
        }

        return foundUser;
    }
    async verifyPassword(hashedPassword: string, inputtedPassword: string) {
        const validPassword = await bcrypt.compare(inputtedPassword, hashedPassword);
        console.log(validPassword)

        return validPassword;
    }
    convertToUserProfile(user: User) {
        return {
            id: user.id,
            email: user.email
        };
    }
}

