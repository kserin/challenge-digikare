import express from "express";
import { dbConnect } from "./dao/db";
import userDao from "./dao/userDao";
import logger from "./logger";
import properties from "./properties";
import userRouter from "./routers/userRouter";
import eventRouter from "./routers/eventRouter";

const app = express();

app.use("/users", userRouter);
app.use("/events", eventRouter)

logger.info("Connecting to database ...");
dbConnect().then(() => {
    app.listen(properties.get("server.port"), () => {
        logger.info(`Started on port ${properties.get("server.port")}!`);
    });
}).catch((e) => {
    logger.error(`Cannot connect to database: ${e}`);
});
