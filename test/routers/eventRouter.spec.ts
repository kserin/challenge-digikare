import { expect } from "chai";
import express from "express";
import http from "http";
import { ObjectId } from "mongodb";
import { AddressInfo } from "net";
import Sinon from "sinon";
import { ConsentEvent } from "../../src/domain/Event";
import { ConsentEventDto, ConsentEventDtoInterface } from "../../src/routers/dto/ConsentEventDto";
import eventRouter from "../../src/routers/eventRouter";
import { ErrorDto } from "../../src/routers/routerUtils";
import consentService, { ConsentService } from "../../src/services/consentService";
import { UserError } from "../../src/services/UserError";
import { get, post } from "./httpUtils";

const app = express();
app.use("/", eventRouter);
const server = http.createServer(app);
let port: number

let stubService: Sinon.SinonStubbedInstance<ConsentService>;

describe("eventRouter", () => {
    before((done) => {
        server.listen(0, () => {
            port = (server.address() as AddressInfo).port;
            done();
        });
    });

    after(() => {
        server.close();
    });

    beforeEach(() => {
        stubService = Sinon.stub(consentService);
    });

    afterEach(() => {
        Sinon.restore();
    });

    describe("POST /", () => {
        it("should return created event", async () => {
            const created: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.create.resolves(created);

            const event: ConsentEventDtoInterface = {
                user: {
                    id: "000000000000000000000001"
                },
                consents: []
            };
            const [code, result]: [number, ConsentEventDto] = await post(`http://localhost:${port}/`, event);

            expect(code).to.equals(200);
            expect(result.user.id).to.equals("000000000000000000000001");
            expect(result.consents.length).to.equals(0);
        });

        it("should return 400 when given event is incorrect", async () => {
            const created: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.create.resolves(created);

            const event: any = {
                // missing user
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, event);

            expect(code).to.equals(400);
            expect(result.code).to.equals("BAD_EVENT_OBJECT");
        });

        it("should return 400 when user does not exists", async () => {
            const created: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.create.throws(new UserError("USER_DOES_NOT_EXIST", "message"));

            const event: ConsentEventDtoInterface = {
                user: {
                    id: "000000000000000000000001"
                },
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, event);

            expect(code).to.equals(400);
            expect(result.code).to.equals("USER_DOES_NOT_EXIST");
            expect(result.message).to.equals("message");
        });

        it("should return 500 when unexpected error happens", async () => {
            const created: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.create.throws(new Error("An error"));

            const event: ConsentEventDtoInterface = {
                user: {
                    id: "000000000000000000000001"
                },
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, event);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("GET /", () => {
        it("should return all events", async () => {
            const event: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.list.resolves([event]);

            const [code, result]: [number, ConsentEventDto[]] = await get(`http://localhost:${port}/`);

            expect(code).to.equals(200);
            expect(result.length).to.equals(1);
            expect(result[0].user.id).to.equals("000000000000000000000001");
            expect(result[0].consents.length).to.equals(0);
        });

        it("should return 500 when unexpected error happens", async () => {
            const event: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.list.throws(new Error("An error"));

            const [code, result]: [number, ErrorDto] = await get(`http://localhost:${port}/`);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("GET /?user=:id", () => {
        it("should return all events for given user", async () => {
            const event: ConsentEvent = {
                _id: new ObjectId("000000000000000000000000"),
                date: new Date(),
                userId: new ObjectId("000000000000000000000001"),
                consents: []
            };
            stubService.list.withArgs("000000000000000000000001").resolves([event]);

            const [code, result]: [number, ConsentEventDto[]] = await get(`http://localhost:${port}/?user=000000000000000000000001`);

            expect(code).to.equals(200);
            expect(result.length).to.equals(1);
            expect(result[0].user.id).to.equals("000000000000000000000001");
            expect(result[0].consents.length).to.equals(0);
        });
    });
});
