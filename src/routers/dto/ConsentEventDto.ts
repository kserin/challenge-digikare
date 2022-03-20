import { ObjectId } from "mongodb";
import { ConsentEvent } from "../../domain/Event";
import { ConsentDto, ConsentDtoInterface } from "./ConsentDto";
import { DtoConvertError } from "./DtoConvertError";

export interface ConsentEventDtoInterface {
    user: {
        id: string;
    }
    consents: ConsentDtoInterface[];
}

export class ConsentEventDto implements ConsentEventDtoInterface {
    public user: { id: string; };
    public consents: ConsentDtoInterface[];

    private constructor(event: ConsentEventDtoInterface) {
        this.user = event.user;
        this.consents = event.consents;
    }

    public toEvent(date: Date): ConsentEvent {
        return {
            userId: new ObjectId(this.user.id),
            consents: this.consents.map((consent) => ConsentDto.fromObject(consent).toConsent()),
            date,
        };
    }

    public static fromObject(object: any): ConsentEventDto {
        if (typeof object.user !== "object") {
            throw new DtoConvertError("Incorrect consent event user");
        }
        if (typeof object.user.id !== "string") {
            throw new DtoConvertError("Incorrect consent event user");
        }
        if (! Array.isArray(object.consents)) {
            throw new DtoConvertError("Incorrect consents");
        }

        return new ConsentEventDto({
            user: {
                id: object.user.id
            },
            consents: (object.consents as []).map((consent) => ConsentDto.fromObject(consent)),
        });
    }

    public static fromEvent(event: ConsentEvent): ConsentEventDto {
        return new ConsentEventDto({
            user: {
                id: event.userId.toString()
            },
            consents: event.consents.map((consent) => ConsentDto.fromConsent(consent))
        });
    }
}
