import { expect } from "chai";
import { ObjectId } from "mongodb";
import Sinon from "sinon";
import { EventDao } from "../../src/dao/eventDao";
import { ConsentEvent } from "../../src/domain/Event";
import { ConsentService } from "../../src/services/consentService";
import { UserError } from "../../src/services/UserError";
import { UserService } from "../../src/services/userService";

describe("ConsentService", () => {
    let stubEventDao: Sinon.SinonStubbedInstance<EventDao>;
    let stubUserService: Sinon.SinonStubbedInstance<UserService>;
    let service: ConsentService;

    beforeEach(() => {
        stubEventDao = Sinon.createStubInstance(EventDao);
        stubUserService = Sinon.createStubInstance(UserService);
        service = new ConsentService(stubUserService, stubEventDao);
    });

    describe("create", () => {
        it("should return created event", async () => {
            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                date: new Date(),
                consents: []
            };
            stubUserService.get.withArgs("000000000000000000000001").resolves({
                _id: new ObjectId("000000000000000000000001"),
                email: "email",
                consents: [],
            });
            stubEventDao.create.withArgs(event).resolves(event);

            const result = await service.create(event);

            expect(result).to.equals(event);
        });

        it("should throw error if user does not exist", async () => {
            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                date: new Date(),
                consents: []
            };
            stubUserService.get.withArgs("000000000000000000000001").resolves(null);
            stubEventDao.create.withArgs(event).resolves(event);

            let error = null;
            try {
                await service.create(event);
            } catch (e) {
                error = e;
            }

            expect(error).to.satisfy((e: any) => e instanceof UserError);
            expect((error as UserError).type).to.equals("USER_DOES_NOT_EXIST");
        });

        it("should update user with new consents", async () => {
            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                date: new Date(),
                consents: [{
                    id: "sms_notifications",
                    enabled: false
                }]
            };
            stubUserService.get.withArgs("000000000000000000000001").resolves({
                _id: new ObjectId("000000000000000000000001"),
                email: "email",
                consents: [{
                    id: "email_notifications",
                    enabled: false
                }],
            });
            stubEventDao.create.withArgs(event).resolves(event);

            await service.create(event);

            expect(stubUserService.update.calledWith({
                _id: new ObjectId("000000000000000000000001"),
                email: "email",
                consents: [{
                    id: "email_notifications",
                    enabled: false
                },
                {
                    id: "sms_notifications",
                    enabled: false
                }],
            })).to.equals(true);
        });

        it("should update user existing consents", async () => {
            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                date: new Date(),
                consents: [{
                    id: "email_notifications",
                    enabled: true
                }]
            };
            stubUserService.get.withArgs("000000000000000000000001").resolves({
                _id: new ObjectId("000000000000000000000001"),
                email: "email",
                consents: [{
                    id: "email_notifications",
                    enabled: false
                },
                {
                    id: "sms_notifications",
                    enabled: false
                }],
            });
            stubEventDao.create.withArgs(event).resolves(event);

            await service.create(event);

            expect(stubUserService.update.calledWith({
                _id: new ObjectId("000000000000000000000001"),
                email: "email",
                consents: [
                {
                    id: "sms_notifications",
                    enabled: false
                },
                {
                    id: "email_notifications",
                    enabled: true
                }],
            })).to.equals(true);
        });
    });

    describe("list", () => {
        it("should return list of events", async () => {
            const id = "000000000000000000000001";
            const event: ConsentEvent = {
                userId: new ObjectId("000000000000000000000001"),
                date: new Date(),
                consents: []
            };
            stubEventDao.list.withArgs(new ObjectId(id)).resolves([event]);

            const result = await service.list(id);

            expect(result.length).to.equals(1);
            expect(result[0]).to.equals(event);
        });
    });
});
