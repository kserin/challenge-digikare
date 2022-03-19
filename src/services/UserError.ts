export type ErrorType = "ALREADY_EXISTING" | "BAD_EMAIL_FORMAT" | "USER_DOES_NOT_EXIST";

export class UserError extends Error {
    constructor(public type: ErrorType, message: string) {
        super(message);
    }
}
