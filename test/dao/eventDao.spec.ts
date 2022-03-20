import { expect } from "chai";
import { Collection, ObjectId } from "mongodb";
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
});
