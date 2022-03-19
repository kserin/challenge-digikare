import { Consent } from "../domain/Consent";
import { DtoConvertError } from "./DtoConvertError";

interface ConsentDtoInterface {
    id: "email_notifications" | "sms_notifications";
    enabled: boolean;
}

export class ConsentDto implements ConsentDtoInterface {
    public id: "email_notifications" | "sms_notifications";
    public enabled: boolean;

    private constructor(consent: ConsentDtoInterface) {
        this.id = consent.id;
        this.enabled = consent.enabled;
    }

    public toConsent(): Consent {
        return {
            id: this.id,
            enabled: this.enabled,
        };
    }

    public static fromObject(object: any): ConsentDto {
        if (["email_notifications", "sms_notifications"].includes(object.id)) {
            throw new DtoConvertError("Incorrect consent id");
        }
        if (typeof object.enabled !== "boolean") {
            throw new DtoConvertError("Incorrect consent enabled");
        }

        return new ConsentDto({
            id: object.id,
            enabled: object.enabled,
        });
    }

    public static fromConsent(consent: Consent): ConsentDto {
        return new ConsentDto({
            id: consent.id,
            enabled: consent.enabled,
        });
    }
}
