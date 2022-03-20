import { expect } from "chai";
import express from "express";
import http from "http";
import { ObjectId } from "mongodb";
import { AddressInfo } from "net";
import Sinon from "sinon";
import { User } from "../../src/domain/User";
import { ErrorDto } from "../../src/routers/routerUtils";
import { UserDto, UserDtoInterface } from "../../src/routers/UserDto";
import userRouter from "../../src/routers/userRouter";
import { UserError } from "../../src/services/UserError";
import userService, { UserService } from "../../src/services/userService";
import { delete_, get, post, put } from "./httpUtils";

const app = express();
app.use("/", userRouter);
const server = http.createServer(app);
let port: number

let stubService: Sinon.SinonStubbedInstance<UserService>;

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
    stubService = Sinon.stub(userService);
});

afterEach(() => {
    Sinon.restore();
});

describe("userRouter", () => {
    describe("GET /", () => {
        it("should return all users", async () => {
            stubService.list.resolves([
                {
                    _id: new ObjectId("000000000000000000000000"),
                    email: "my@email.com",
                    consents: []
                }
            ]);

            const [code, result]: [number, UserDto[]] = await get(`http://localhost:${port}/`);

            expect(code).to.equals(200);
            expect(result.length).to.equals(1);
            expect(result[0].id).to.equals("000000000000000000000000");
            expect(result[0].email).to.equals("my@email.com");
            expect(result[0].consents.length).to.equals(0);
        });

        it("should return 500 when unexpected error happens", async () => {
            stubService.list.throws(new Error("An error"));

            const [code, result]: [number, ErrorDto] = await get(`http://localhost:${port}/`);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("GET /:id", () => {
        it("should return with with given id", async () => {
            const id = "000000000000000000000000"
            stubService.get.withArgs(id).resolves({
                _id: new ObjectId("000000000000000000000000"),
                email: "my@email.com",
                consents: []
            });

            const [code, result]: [number, UserDto] = await get(`http://localhost:${port}/${id}`);

            expect(code).to.equals(200);
            expect(result.id).to.equals("000000000000000000000000");
            expect(result.email).to.equals("my@email.com");
            expect(result.consents.length).to.equals(0);
        });

        it("should return 404 if user does not exist", async () => {
            const id = "000000000000000000000000"
            stubService.get.withArgs(id).resolves(null);

            const [code, result]: [number, ErrorDto] = await get(`http://localhost:${port}/${id}`);

            expect(code).to.equals(404);
            expect(result.code).to.equals("USER_NOT_FOUND");
        });

        it("should return 500 when unexpected error happens", async () => {
            const id = "000000000000000000000000"
            stubService.get.withArgs(id).throws(new Error("An error"));

            const [code, result]: [number, ErrorDto] = await get(`http://localhost:${port}/${id}`);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("POST /", () => {
        it("should return created user", async () => {
            const created: User = {
                _id: new ObjectId("000000000000000000000000"),
                email: "my@email.com",
                consents: []
            };
            stubService.create.resolves(created);

            const user: UserDtoInterface = {
                id: undefined,
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, UserDto] = await post(`http://localhost:${port}/`, user);

            expect(code).to.equals(200);
            expect(result.id).to.equals("000000000000000000000000");
            expect(result.email).to.equals("my@email.com");
            expect(result.consents.length).to.equals(0);
        });

        it("should return 400 if given user is incorrect", async () => {
            const user = {
                id: undefined,
                // missing email
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, user);

            expect(code).to.equals(400);
            expect(result.code).to.equals("BAD_USER_OBJECT");
        });

        it("should return 400 if given user cannot be created", async () => {
            stubService.create.throws(new UserError("ALREADY_EXISTING", "message"));

            const user: UserDtoInterface = {
                id: undefined,
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, user);

            expect(code).to.equals(400);
            expect(result.code).to.equals("ALREADY_EXISTING");
            expect(result.message).to.equals("message");
        });

        it("should return 500 when unexpected error happens", async () => {
            stubService.create.throws(new Error("An error"));

            const user: UserDtoInterface = {
                id: undefined,
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await post(`http://localhost:${port}/`, user);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("PUT /:id", () => {
        it("should return updated user", async () => {
            const updated: User = {
                _id: new ObjectId("000000000000000000000000"),
                email: "my@email.com",
                consents: []
            };
            stubService.update.resolves(updated);

            const user: UserDtoInterface = {
                id: "000000000000000000000000",
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, UserDto] = await put(`http://localhost:${port}/000000000000000000000000`, user);

            expect(code).to.equals(200);
            expect(result.id).to.equals("000000000000000000000000");
            expect(result.email).to.equals("my@email.com");
            expect(result.consents.length).to.equals(0);
        });

        it("should return 400 if given user is incorrect", async () => {
            const user = {
                id: "000000000000000000000000",
                // missing email
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await put(`http://localhost:${port}/000000000000000000000000`, user);

            expect(code).to.equals(400);
            expect(result.code).to.equals("BAD_USER_OBJECT");
        });

        it("should return 400 if given user cannot be created", async () => {
            stubService.update.throws(new UserError("ALREADY_EXISTING", "message"));

            const user: UserDtoInterface = {
                id: "000000000000000000000000",
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await put(`http://localhost:${port}/000000000000000000000000`, user);

            expect(code).to.equals(400);
            expect(result.code).to.equals("ALREADY_EXISTING");
            expect(result.message).to.equals("message");
        });

        it("should return 500 when unexpected error happens", async () => {
            stubService.update.throws(new Error("An error"));

            const user: UserDtoInterface = {
                id: "000000000000000000000000",
                email: "my@email.com",
                consents: []
            };
            const [code, result]: [number, ErrorDto] = await put(`http://localhost:${port}/000000000000000000000000`, user);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });

    describe("DELETE /:id", () => {
        it("should delete user by id", async () => {
            const id = "000000000000000000000000"

            const [code, _] = await delete_(`http://localhost:${port}/${id}`);

            expect(code).to.equals(200);
            stubService.delete.calledWith(id)
        });

        it("should return 400 if id is incorrect", async () => {
            const id = "000000000000000000000000"
            stubService.delete.throws(new UserError("USER_DOES_NOT_EXIST", "message"));

            const [code, result]: [number, ErrorDto] = await delete_(`http://localhost:${port}/${id}`);

            expect(code).to.equals(400);
            expect(result.code).to.equals("USER_DOES_NOT_EXIST");
            expect(result.message).to.equals("message");
        });

        it("should return 500 when unexpected error happens", async () => {
            const id = "000000000000000000000000"
            stubService.delete.throws(new Error("An error"));

            const [code, result]: [number, ErrorDto] = await delete_(`http://localhost:${port}/${id}`);

            expect(code).to.equals(500);
            expect(result.code).to.equals("INTERNAL_ERROR");
            expect(result.message).to.equals("An error");
        });
    });
});
