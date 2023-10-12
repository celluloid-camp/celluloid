import { UserRole } from '@celluloid/prisma';
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import * as url from 'url'

import passport from "./passport"
import getAdminRouter from "./server.js";
import { createSession } from './session';

const PORT = process.env.PORT || 4000


const start = async () => {
  const app = express();
  app.enable('trust proxy');
  app.use(cors({ credentials: true, origin: true }));
  app.use(createSession());
  app.use(passport.authenticate("session"));

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

  const isAuthenticated = function (req, res, next) {
    if (req.user && req.user.role == UserRole.Admin)
      return next();
    res.redirect('/')
  }


  app.use('/admin', isAuthenticated, adminRouter);

  const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

  app.use("/admin", express.static(path.join(__dirname, "../public")));

  app.listen(PORT, () => {
    console.log(
      `AdminJS started on localhost:${PORT}`
    );
  });
};

start()

