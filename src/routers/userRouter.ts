import express, { Router } from "express";
import { UserError } from "../services/UserError";
import userService from "../services/userService";
import { DtoConvertError } from "./DtoConvertError";
import { error, json, serverError } from "./routerUtils";
import { UserDto } from "./UserDto";

const userRouter = Router();
userRouter.use(express.json());

userRouter.get("/", async (_, res) => {
    try {
        const result = (await userService.list()).map((user) => UserDto.fromUser(user));
        return json(res, result);
    } catch (e) {
        serverError(res, e);
    }
});

userRouter.get("/:id", async (req, res) => {  // TODO : URI with email inside to get human readable URI
    try {
        const user = await userService.get(req.params.id);
        if (!user) {
            error(res, 404, {code: "USER_NOT_FOUND", message: `No user with id ${req.params.id} found`});
        } else {
            json(res, UserDto.fromUser(user));
        }
    } catch (e) {
        serverError(res, e);
    }
});

userRouter.post("/", async (req, res) => {
    try {
        const dto = UserDto.fromObject(req.body);
        const result = UserDto.fromUser(await userService.create(dto.toUser()));
        json(res, result);
    } catch (e) {
        if (e instanceof DtoConvertError) {
            error(res, 400, {code: "BAD_USER_OBJECT", message: e.message});
        } else if (e instanceof UserError) {
            error(res, 400, {code: e.type, message: e.message})
        } else {
            serverError(res, e);
        }
    }
});

userRouter.put("/:id", async (req, res) => {
    try {
        const dto = UserDto.fromObject(req.body);
        dto.id = req.params.id;
        const result = UserDto.fromUser(await userService.update(dto.toUser()));
        json(res, result);
    } catch (e) {
        if (e instanceof DtoConvertError) {
            error(res, 400, {code: "BAD_USER_OBJECT", message: e.message});
        } else if (e instanceof UserError) {
            error(res, 400, {code: e.type, message: e.message})
        } else {
            serverError(res, e);
        }
    }
});

userRouter.delete("/:id", async (req, res) => {
    try {
        await userService.delete(req.params.id);
        res.send(200).send();
    } catch (e) {
        if (e instanceof UserError) {
            error(res, 400, {code: e.type, message: e.message})
        } else {
            serverError(res, e);
        }
    }
});

export default userRouter;
