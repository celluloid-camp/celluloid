import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: isProduction ? "info" : "debug",
  browser: {
    asObject: true,
    write: (o) => {
      console.log(JSON.stringify(o));
    },
  },
});

export default logger;
