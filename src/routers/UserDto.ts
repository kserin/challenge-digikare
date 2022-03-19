import { ObjectId } from "mongodb";
import { User } from "../domain/User";
import { ConsentDto } from "./ConsentDto";
import { DtoConvertError } from "./DtoConvertError";

interface UserDtoInterface {
    id: string | undefined;
    email: string;
    consents: ConsentDto[];
}

export class UserDto implements UserDtoInterface {
    public id: string | undefined;
    public email: string;
    public consents: ConsentDto[];

    private constructor(user: UserDtoInterface) {
        this.id = user.id;
        this.email = user.email;
        this.consents = user.consents;
    }

    public toUser(): User {
        return {
            _id: this.id ? new ObjectId(this.id) : undefined,
            email: this.email,
            consents: this.consents.map((consentDto) => consentDto.toConsent())
        }
    }

    public static fromObject(object: any): UserDto {
        if (object.id && typeof object.id !== "string") {
            throw new DtoConvertError("Incorrect user id");
        }
        if (!object.email || typeof object.email !== "string") {
            throw new DtoConvertError("Incorrect email");
        }
        if (object && !Array.isArray(object.consents)) {
            throw new DtoConvertError("Consents is not an array");
        }

        const consents = (object.consents as any[]).map((consent) => ConsentDto.fromObject(consent));
        return new UserDto({
            id: object.id,
            email: object.email,
            consents
        });
    }

    public static fromUser(user: User): UserDto {
        return new UserDto({
            id: (user._id) ? user._id.toString() : undefined,
            email: user.email,
            consents: user.consents.map((consent) => ConsentDto.fromConsent(consent))
        });
    }
}

