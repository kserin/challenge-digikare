import { Db } from "mongodb";
import { User } from "../domain/User";
import logger from "../logger";
import database from "./db";

export class UserDao {
    private static readonly COLLECTION = "users";

    constructor(private db: Db) {
    }

    public async get(id: string): Promise<User | null> {
        try {
            return await this.db.collection(UserDao.COLLECTION).findOne({id}) as User;
        } catch (e) {
            logger.error(`Cannot get user ${id} from database`, e);
            return null;
        }
    }

    public async list(): Promise<User[]> {
        try {
            return await this.db.collection(UserDao.COLLECTION).find({}).toArray() as User[];
        } catch (e) {
            logger.error("Cannot list user from database", e);
            return [];
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            await this.db.collection(UserDao.COLLECTION).deleteOne({id});
        } catch (e) {
            logger.error(`Cannot delete user ${id} from database`, e);
        }
    }

    public async update(user: User): Promise<User> {
        if (!user._id) {
            throw new Error("Cannot update user with identifier");
        }
        const result = await this.db.collection(UserDao.COLLECTION).updateOne({_id: user._id}, user)
        if (result.modifiedCount === 0) {
            throw new Error(`User ${user._id} not updated`);
        }
        return user;
    }

    public async create(user: User): Promise<User> {
        if (user._id !== undefined) {
            throw new Error(`User already has an id: ${user._id}`);
        }
        const result = await this.db.collection(UserDao.COLLECTION).insertOne(user);
        if (result.insertedId === null) {
            throw new Error(`User ${user.email} not inserted`);
        }
        user._id = result.insertedId;
        return user;
    }
}

export default new UserDao(database);
