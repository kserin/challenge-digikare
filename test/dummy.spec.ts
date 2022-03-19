import { expect } from "chai";
import { Collection, FindCursor, ObjectId, OptionalId } from "mongodb";
import Sinon from "sinon";
import userDao from "../src/dao/userDao";
import { User } from "../src/domain/User";
import db = require("../src/dao/db");

let stubDb: any;
let stubCollection: Sinon.SinonStubbedInstance<Collection>;
beforeEach(() => {
    stubCollection = Sinon.createStubInstance(Collection);
    stubDb = Sinon.stub(db, "getDb");
    stubDb.returns({collection: () => stubCollection});
});

afterEach(() => {
    stubDb.restore();
});

describe("userDao", () => {
    describe("get", () => {
        it("should return user by given id", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "email",
                consents: []
            };
            stubCollection.findOne.withArgs({_id: user._id}).resolves(user);

            const result = await userDao.get("000000000000");

            expect(result?._id).to.equals(user._id);
        });

        it("should return null when id does not exist", async () => {
            stubCollection.findOne.withArgs({_id: new ObjectId("000000000000")}).resolves(null);

            const result = await userDao.get("000000000000");

            expect(result).to.equals(null);
        });
    });

    describe("getByEmail", () => {
        it("should return user by given email", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "email",
                consents: []
            };
            stubCollection.findOne.withArgs({email: user.email}).resolves(user);

            const result = await userDao.getByEmail("email");

            expect(result?.email).to.equals(user.email);
        });

        it("should return null when email does not exist", async () => {
            stubCollection.findOne.withArgs({email: "email"}).resolves(null);

            const result = await userDao.getByEmail("email");

            expect(result).to.equals(null);
        });
    });

    describe("list", () => {
        it("should return all users", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "email",
                consents: []
            };
            const stubCursor = Sinon.createStubInstance(FindCursor);
            stubCursor.toArray.resolves([user, user]);
            stubCollection.find.withArgs({}).returns(stubCursor);

            const result = await userDao.list();

            expect(result.length).to.equals(2);
        });
    });

    describe("delete", () => {
        it("should remove user with given id", async () => {
            await userDao.delete("000000000000");

            expect(stubCollection.deleteOne.calledWith({_id: new ObjectId("000000000000")})).to.equals(true);
        });
    });

    describe("update", () => {
        it("should update user", async () => {
            const user: User = {
                _id: new ObjectId("000000000000"),
                email: "email",
                consents: []
            };
            await userDao.update(user);

            expect(stubCollection.updateOne.calledWith({_id: user._id}, {$set: user})).to.equals(true);
        });

        it("should throw error when user id is undefined", async () => {
            let thrown = false;
            try {
                const user: User = {
                    _id: undefined,
                    email: "email",
                    consents: []
                };
                await userDao.update(user);
            } catch (e) {
                thrown = true;
            }

            expect(thrown).to.equals(true);
        });
    });


    describe("create", () => {
        it("should create new user", async () => {
            stubCollection.insertOne.resolves({
                insertedId: new ObjectId("000000000000")
            });

            const user: User = {
                _id: undefined,
                email: "email",
                consents: []
            };
            const result = await userDao.create(user);

            expect(result._id?.toString()).to.equals(new ObjectId("000000000000").toString());
        });

        it("should throw error when given user has an id", async () => {
            stubCollection.insertOne.resolves({
                insertedId: new ObjectId("000000000000")
            });

            let thrown = false;
            try {
                const user: User = {
                    _id: new ObjectId("000000000000"),
                    email: "email",
                    consents: []
                };
                await userDao.create(user);
            } catch (e) {
                thrown = true;
            }

            expect(thrown).to.equals(true);
        });
    });
});
