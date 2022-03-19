import { ObjectId } from "mongodb";
import { User } from "../domain/User";
import logger from "../logger";
import { getDb } from "./db";

export class UserDao {
    private static readonly COLLECTION = "users";

    public async get(id: string): Promise<User | null> {
        try {
            return await getDb().collection(UserDao.COLLECTION).findOne({_id: new ObjectId(id)}) as User;
        } catch (e) {
            logger.debug(`Cannot get user ${id} from database`, e);
            return null;
        }
    }

    public async getByEmail(email: string): Promise<User | null> {
        try {
            return await getDb().collection(UserDao.COLLECTION).findOne({email}) as User;
        } catch (e) {
            logger.debug(`Cannot get user ${email} from database`, e);
            return null;
        }
    }

    public async list(): Promise<User[]> {
        try {
            return await getDb().collection(UserDao.COLLECTION).find({}).toArray() as User[];
        } catch (e) {
            logger.debug("Cannot list user from database", e);
            return [];
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            await getDb().collection(UserDao.COLLECTION).deleteOne({_id: new ObjectId(id)});
        } catch (e) {
            logger.debug(`Cannot delete user ${id} from database`, e);
        }
    }

    public async update(user: User): Promise<User> {
        if (!user._id) {
            throw new Error("Cannot update user with identifier");
        }
        await getDb().collection(UserDao.COLLECTION).updateOne({_id: user._id}, {$set: user})
        return user;
    }

    public async create(user: User): Promise<User> {
        if (user._id !== undefined) {
            throw new Error(`User already has an id: ${user._id}`);
        }
        const result = await getDb().collection(UserDao.COLLECTION).insertOne(user);
        if (result.insertedId === null) {
            throw new Error(`User ${user.email} not inserted`);
        }
        user._id = result.insertedId;
        return user;
    }
}

export default new UserDao();
