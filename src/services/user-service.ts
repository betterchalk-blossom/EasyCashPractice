import {TokenService} from '@loopback/authentication';
import {MyUserService, TokenServiceBindings, UserServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {repository} from "@loopback/repository";
import {HttpErrors} from '@loopback/rest';
import {Login, Transfer, transfer_status, User} from "../models";
import {TransferRepository, UserRepository} from "../repositories";
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

    async signup(user: User) {
        const userExists = await this.userRepo.findOne({
            where: {email: user.email.toLowerCase()}
        });

        if (userExists) {
            throw new HttpErrors.Conflict(IfUserExistsError);
        }

        bcrypt.genSalt(10, (err: any, salt: any) => {
            bcrypt.hash(user.password, salt, (err: any, hash: string) => {
                user.password = hash;
            });
        });

        return this.userRepo.create({
            email: user.email,
            password: user.password,
            accounts: user.accounts,
            balance: user.balance
        });
    }

    async loginUser(login: Login) {
        // ensure the user exists, and the password is correct
        const user = await this.userService.verifyCredentials(login);

        // convert a User object into a UserProfile object (reduced set of properties)
        const userProfile = this.userService.convertToUserProfile(user);

        // create a JSON Web Token based on the user profile
        const token = await this.jwtService.generateToken(userProfile);
        return {token};
    }

    async updateCashBalance(id: string, user: User) {
        const user_id = await this.userRepo.findById(id);
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
}

