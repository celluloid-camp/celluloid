

import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

export const expressAuthHandler = toNodeHandler(auth);


