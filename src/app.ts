import express from "express";
import userDao from "./dao/userDao";
import logger from "./logger";
import properties from "./properties";

const app = express();

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

app.listen(properties.get("server.port"), () => {
    logger.info(`Started on port ${properties.get("server.port")}!`)
});
