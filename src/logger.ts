import { env } from "process";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
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
