import { ObjectId } from "mongodb";
import dao, { EventDao } from "../dao/eventDao";
import { Consent } from "../domain/Consent";
import { ConsentEvent } from "../domain/Event";
import { User } from "../domain/User";
import { UserError } from "./UserError";
import service, { UserService } from "./userService";

export class ConsentService {
    constructor(private userService: UserService, private eventDao: EventDao) {
    }

    public async create(event: ConsentEvent): Promise<ConsentEvent> {
        const user = await this.userService.get(event.userId.toString());
        if (user === null) {
            throw new UserError("USER_DOES_NOT_EXIST", "User with given id does not exist");
        }

        event.consents.forEach((consent) => this.setUserConsent(user, consent));
        const [_, result] = await Promise.all([this.userService.update(user), this.eventDao.create(event)]);

        return result;
    }

    public async list(userId?: string): Promise<ConsentEvent[]> {
        return await this.eventDao.list(userId ? new ObjectId(userId) : undefined);
    }

    private setUserConsent(user: User, consent: Consent) {
        user.consents.forEach((element, index, array) => {
            if (element.id === consent.id) {
                array.splice(index, 1);
            }
        });
        user.consents.push(consent);
    }
}

export default new ConsentService(service, dao);
