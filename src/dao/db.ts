import { Db, MongoClient } from "mongodb";
import properties from "../properties";

let db: Db | undefined;

export async function dbConnect(): Promise<Db> {
    if (!db) {
        const mongoUri = properties.getRaw("mongo.uri");
        const mongoDb = properties.getRaw("mongo.db");
        if (mongoUri === null || mongoDb === null) {
            throw new Error("Mongo is not configured");
        }
        const client = new MongoClient(mongoUri);
        await client.connect();
        db = client.db(mongoDb);
    }

    return db;
}

export function getDb(): Db {
    if (db === undefined) {
        throw new Error("Database not initialized");
    }
    return db;
}

