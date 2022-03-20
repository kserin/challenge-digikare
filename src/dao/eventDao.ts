import { ConsentEvent } from "../domain/Event";
import { getDb } from "./db";

export class EventDao {
    private static readonly COLLECTION = "events";

    public async create(event: ConsentEvent): Promise<ConsentEvent> {
        if (event._id !== undefined) {
            throw new Error(`Event already has an id: ${event._id}`);
        }

        const result = await getDb().collection(EventDao.COLLECTION).insertOne(event);
        if (result.insertedId === null) {
            throw new Error(`Event not inserted`);
        }
        event._id = result.insertedId;

        return event;
    }
}

export default new EventDao();
