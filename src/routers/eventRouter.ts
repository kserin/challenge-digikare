import express, { Router } from "express";
import consentService from "../services/consentService";
import { UserError } from "../services/UserError";
import { ConsentEventDto } from "./dto/ConsentEventDto";
import { DtoConvertError } from "./dto/DtoConvertError";
import { error, json, serverError } from "./routerUtils";

const eventRouter = Router();
eventRouter.use(express.json());

eventRouter.post("/", async (req, res) => {
    try {
        const dto = ConsentEventDto.fromObject(req.body);
        const result = ConsentEventDto.fromEvent(await consentService.create(dto.toEvent(new Date())));
        json(res, result);
    } catch (e) {
        if (e instanceof DtoConvertError) {
            error(res, 400, {code: "BAD_EVENT_OBJECT", message: e.message});
        } else if (e instanceof UserError) {
            error(res, 400, {code: e.type, message: e.message})
        } else {
            serverError(res, e);
        }
    }
});

export default eventRouter;