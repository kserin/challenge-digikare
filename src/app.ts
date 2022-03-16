import express from "express";
import logger from "./logger";
import properties from "./properties";

const app = express();

app.get("/hello", (_, res) => {
    res.set("Content-Type", "application/json")
        .status(200)
        .send(JSON.stringify({"Hello": "World"}));
});

app.listen(properties.get("server.port"), () => {
    logger.info(`Started on port ${properties.get("server.port")}!`)
});
