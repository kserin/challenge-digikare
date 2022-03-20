import { expect } from "chai";
import { ObjectId } from "mongodb";
import Sinon from "sinon";
import { UserDao } from "../../src/dao/userDao";
import { User } from "../../src/domain/User";
import { UserError } from "../../src/services/UserError";
import { UserService } from "../../src/services/userService";


describe("UserService", () => {
    let stubUserDao: Sinon.SinonStubbedInstance<UserDao>;
    let service: UserService;

    beforeEach(() => {
        stubUserDao = Sinon.createStubInstance(UserDao);
        service = new UserService(stubUserDao);
    });

    describe("create", () => {
        it("should create new user", async () => {
            const user: User = {
                _id: undefined,
                email: "my@email.com",
                consents: []
            };
            stubUserDao.create.withArgs(user).resolves(user);
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);

            const result = await service.create(user);

            expect(result).to.equals(user);
        });

        it("should throw error when user email is not valid", async () => {
            const user: User = {
                _id: undefined,
                email: "invalidEmail",
                consents: []
            };
            stubUserDao.create.withArgs(user).resolves(user);
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);

            let error = null;
            try {
                await service.create(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("BAD_EMAIL_FORMAT");
        });

        it("should throw error when user email already exists", async () => {
            const user: User = {
                _id: undefined,
                email: "my@email.com",
                consents: []
            };
            stubUserDao.create.withArgs(user).resolves(user);
            stubUserDao.getByEmail.withArgs(user.email).resolves({
                _id: new ObjectId("000000000000"),
                email: "my@email.com",
                consents: []
            });

            let error = null;
            try {
                await service.create(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("ALREADY_EXISTING");
        });

        it("should throw error when user id is defined", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my@email.com",
                consents: []
            };
            stubUserDao.create.withArgs(user).resolves(user);
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);

            let error = null;
            try {
                await service.create(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("ALREADY_EXISTING");
        });
    });

    describe("list", () => {
        it("should return all users", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my@email.com",
                consents: []
            };
            stubUserDao.list.resolves([user]);

            const result = await service.list();

            expect(result.length).to.equals(1);
            expect(result[0]).to.equals(user);
        });
    });

    describe("get", () => {
        it("should return user by id", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my@email.com",
                consents: []
            };
            stubUserDao.get.withArgs("000000000000").resolves(user);

            const result = await service.get("000000000000");

            expect(result).to.equals(user);
        });
    });

    describe("update", () => {
        it("update user data", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my.new@email.com",
                consents: []
            };
            stubUserDao.get.withArgs(new ObjectId("000000000000").toString()).resolves({
                _id: new ObjectId("000000000000"),
                email: "my.old@email.com",
                consents: []
            });
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);
            stubUserDao.update.withArgs(user).resolves(user);

            const result = await service.update(user);

            expect(result).to.equals(user);
        });

        it("throw error when new email is already used by another user", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my.new@email.com",
                consents: []
            };
            stubUserDao.get.withArgs(new ObjectId("000000000000").toString()).resolves({
                _id: new ObjectId("000000000000"),
                email: "my.old@email.com",
                consents: []
            });
            stubUserDao.getByEmail.withArgs(user.email).resolves({
                _id: new ObjectId("000000000001"),
                email: "my.new@email.com",
                consents: []
            });
            stubUserDao.update.withArgs(user).resolves(user);

            let error = null;
            try {
                await service.update(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("ALREADY_EXISTING");
        });

        it("throw error when new email is invalid", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "invalidemail",
                consents: []
            };
            stubUserDao.get.withArgs(new ObjectId("000000000000").toString()).resolves({
                _id: new ObjectId("000000000000"),
                email: "my.old@email.com",
                consents: []
            });
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);
            stubUserDao.update.withArgs(user).resolves(user);

            let error = null;
            try {
                await service.update(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("BAD_EMAIL_FORMAT");
        });

        it("throw error when user is not found", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "my.new@email.com",
                consents: []
            };
            stubUserDao.get.withArgs(new ObjectId("000000000000").toString()).resolves(null);
            stubUserDao.getByEmail.withArgs(user.email).resolves(null);
            stubUserDao.update.withArgs(user).resolves(user);

            let error = null;
            try {
                await service.update(user);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("USER_DOES_NOT_EXIST");
        });
    });

    describe("delete", () => {
        it("delete user", async () => {
            const id = "123";
            stubUserDao.get.withArgs(id).resolves({
                _id: new ObjectId("000000000000"),
                email: "my.new@email.com",
                consents: []
            });

            await service.delete(id);

            expect(stubUserDao.delete.calledWith(id)).to.equals(true);
        });

        it("throw exception when user does not exist", async () => {
            const id = "123";
            stubUserDao.get.withArgs(id).resolves(null);

            let error = null;
            try {
                await service.delete(id);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("USER_DOES_NOT_EXIST");
        });
    });
});
