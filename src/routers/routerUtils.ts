import { Response } from "express";
import logger from "../logger";

export interface ErrorDto {
    code: string;
    message: string;
}

export function json(res: Response, data: any) {
    res.set("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(data));
}

export function error(res: Response, code: number, err: ErrorDto) {
    res.status(code).send(JSON.stringify(err));
}

export function serverError(res: Response, e: any) {
    if (e.stack) {
        logger.error(e.stack);
    }
    const message = (e instanceof Error) ? e.message : "Unknown error";
    error(res, 500, {code: "INTERNAL_ERROR", message});
}
