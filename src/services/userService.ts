import dao, { UserDao } from "../dao/userDao";
import { User } from "../domain/User";
import { UserError } from "./UserError";

export class UserService {
    constructor(private userDao: UserDao) {
    }

    public async create(user: User): Promise<User> {
        this.checkUser(user);
        if (user._id !== undefined) {
            throw new UserError("ALREADY_EXISTING", "Cannot create user with id");
        }
        if (await this.userDao.getByEmail(user.email) !== null) {
            throw new UserError("ALREADY_EXISTING", `Email ${user.email} already exists`);
        }
        return await this.userDao.create(user);
    }

    public async list(): Promise<User[]> {
        // TODO : pagination
        return await this.userDao.list();
    }

    public async get(id: string): Promise<User | null> {
        return await this.userDao.get(id);
    }

    public async update(user: User): Promise<User> {
        this.checkUser(user);
        if (!user._id || await this.userDao.get(user._id.toString()) === null) {
            throw new UserError("USER_DOES_NOT_EXIST", "User with given id does not exist");
        }
        const existing = await this.userDao.getByEmail(user.email);
        if (existing !== null && existing._id?.toString() !== user._id.toString()) {
            throw new UserError("ALREADY_EXISTING", `Email ${user.email} already exists`);
        }
        return await this.userDao.update(user);
    }

    public async delete(id: string) {
        if (await this.userDao.get(id) === null) {
            throw new UserError("USER_DOES_NOT_EXIST", `User with id ${id} does not exist`);
        }
        await this.userDao.delete(id);
    }

    private checkUser(user: User) {
        if (!user.email || !this.isValidEmail(user.email)) {
            throw new UserError("BAD_EMAIL_FORMAT", `Invalid email format ${user.email}`);
        }
    }

    private isValidEmail(email: string): boolean {
        const regexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return regexp.test(email);
    }
}

export default new UserService(dao);
