import { ObjectId } from "mongodb";
import { Consent } from "./Consent";

export interface User {
    _id: ObjectId | undefined;
    email: string;
    consents: Consent[];
}
