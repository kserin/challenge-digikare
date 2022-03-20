import { ObjectId } from "mongodb";
import { Consent } from "./Consent";

export interface ConsentEvent {
    _id?: ObjectId;
    userId: ObjectId;
    date: Date;
    consents: Consent[];
}
