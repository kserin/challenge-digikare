import { env } from "process";
import winston from "winston";
import properties from "./properties";

const loglevel = properties.getRaw("server.loglevel");
const logger = winston.createLogger({
    level: loglevel ? loglevel : "info",
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.errors({stack: true}),
                winston.format.simple(),
            ),
            silent: (env.TESTS) ? true : false
        })
    ]
});

export default logger;
