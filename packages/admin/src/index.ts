// import RedisStore from 'connect-redis';
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { Session } from 'express-session';
import path from "path";
import { createClient } from "redis";
import * as url from 'url'

import getAdminRouter from "./server.js";

const redisClient = createClient({ legacyMode: true, url: process.env.CELLULOID_REDIS_URL || "redis://localhost" });
redisClient.connect().catch(console.error)

// const redisStore = new RedisStore({
//   client: redisClient
// })

interface UserSession extends Session {
  user?: {
    id: string;
    username: string;
    // Add other user properties as needed
  };
}
const start = async () => {
  const app = express();
  app.use(cors());

  // app.use(
  //   session({
  //     store: redisStore,
  //     cookie: {
  //       domain: process.env.CELLULOID_COOKIE_DOMAIN
  //         ? process.env.CELLULOID_COOKIE_DOMAIN
  //         : undefined,
  //       secure: process.env.CELLULOID_COOKIE_SECURE === "true",
  //       maxAge: 30 * 24 * 3600 * 1000,
  //       httpOnly: true,
  //     },
  //     secret: process.env.CELLULOID_COOKIE_SECRET as string,
  //     resave: false,
  //     saveUninitialized: false,
  //   })
  // );

  const requireUser = (req: Request & { session: UserSession }, res: Response, next: NextFunction) => {
    if (req.session.user) {
      // User exists in the session, continue to the next middleware or route handler
      next();
    } else {
      // User is not authenticated, redirect to login or send an error response
      res.redirect('/login');
    }
  };


  // Define the CORS middleware function
  const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Set the CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Call the next middleware function in the chain
    next();
  };

  // Add the CORS middleware function to the application
  app.use(corsMiddleware);


  const adminRouter = await getAdminRouter({
    rootPath: "/admin"
  });


  app.use('/admin', adminRouter);

  const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

  app.use("/admin", express.static(path.join(__dirname, "../public")));

  app.listen(3000, () => {
    console.log(
      `AdminJS started on localhost:3000`
    );
  });
};

start()

