import { expect } from "chai";
import { Collection, FindCursor, ObjectId } from "mongodb";
import Sinon from "sinon";
import db = require("../../src/dao/db");
import eventDao from "../../src/dao/eventDao";
import { ConsentEvent } from "../../src/domain/Event";

describe("eventDao", () => {
    let stubCollection: Sinon.SinonStubbedInstance<Collection>;
    beforeEach(() => {
        stubCollection = Sinon.createStubInstance(Collection);
        const stubDb: any = Sinon.stub(db, "getDb");
        stubDb.returns({collection: () => stubCollection});
    });

    afterEach(() => {
        Sinon.restore();
    });

    describe("create", () => {
        it("should create new event", async () => {
            stubCollection.insertOne.resolves({
                insertedId: new ObjectId("000000000000000000000000")
            });

            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                consents: [],
                date: new Date(),
            };
            const result = await eventDao.create(event);

            expect(result._id?.toString()).to.equals("000000000000000000000000");
        });

        it("should throw error when given event has an id", async () => {
            stubCollection.insertOne.resolves({
                insertedId: new ObjectId("000000000000000000000000")
            });

            let thrown = false;
            try {
                const event: ConsentEvent = {
                    _id: new ObjectId("000000000000000000000000"),
                    userId: new ObjectId("000000000000000000000001"),
                    consents: [],
                    date: new Date(),
                };
                await eventDao.create(event);
            } catch (e) {
                thrown = true;
            }

            expect(thrown).to.equals(true);
        });
    });

    describe("list", () => {
        it("should return events", async () => {
            const stubCursor = Sinon.createStubInstance(FindCursor);
            stubCursor.toArray.resolves([{
                _id: new ObjectId("000000000000000000000000"),
                userId: new ObjectId("000000000000000000000001"),
                consents: [],
                date: new Date(),
            }]);
            stubCollection.find.withArgs({}).returns(stubCursor);

            const result = await eventDao.list();

            expect(result.length).to.equals(1);
        });

        it("should return events filtered by user id", async () => {
            const stubCursor = Sinon.createStubInstance(FindCursor);
            stubCursor.toArray.resolves([{
                _id: new ObjectId("000000000000000000000000"),
                userId: new ObjectId("000000000000000000000001"),
                consents: [],
                date: new Date(),
            }]);
            stubCollection.find.withArgs({userId: new ObjectId("000000000000000000000001")}).returns(stubCursor);

            const result = await eventDao.list(new ObjectId("000000000000000000000001"));

            expect(result.length).to.equals(1);
        });
    });
});
