import express from "express";
import { dbConnect, getDb } from "./dao/db";
import userDao from "./dao/userDao";
import logger from "./logger";
import properties from "./properties";
import userRouter from "./routers/userRouter";

const app = express();

app.use("/users", userRouter);

app.get("/hello", async (_, res) => {
    await userDao.create({
        _id: undefined,
        email: "email",
        consents: []
    });
    const users = await userDao.list();
    res.set("Content-Type", "application/json")
        .status(200)
        .send(JSON.stringify(users));
});

logger.info("Connecting to database ...");
dbConnect().then(() => {
    app.listen(properties.get("server.port"), () => {
        logger.info(`Started on port ${properties.get("server.port")}!`);
    });
}).catch((e) => {
    logger.error(`Cannot connect to database: ${e}`);
});
