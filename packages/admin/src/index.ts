import express from "express";
import path from "path";
import * as url from 'url'

import getAdminRouter from "./server.js";


const start = async () => {
  const app = express();

  const adminRouter = await getAdminRouter({
    rootPath: "/"
  });

  app.use('/', adminRouter);

  const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

  app.use(express.static(path.join(__dirname, "../public")));

  app.get("/*", (_, res) => res.status(404).send("page not found"));

  app.listen(3000, () => {
    console.log(
      `AdminJS started on localhost:3000`
    );
  });
};

start()

