import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import * as url from 'url'

import getAdminRouter from "./server.js";


const start = async () => {
  const app = express();
  app.use(cors());

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

  if (process.env.NODE_ENV == "production") {
    app.use("/admin", express.static(path.join(__dirname, "../public")));
  }



  // app.get("/*", (_, res) => res.status(404).send("page not found"));

  app.listen(3000, () => {
    console.log(
      `AdminJS started on localhost:3000`
    );
  });
};

start()

