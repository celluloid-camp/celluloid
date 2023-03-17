import "./Config";

import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import expressPino from "express-pino-logger";
import { NodePlugin } from "graphile-build";
import passport from "passport";
import postgraphile, { Plugin } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

import ProjectsApi from "./api/ProjectApi";
import TagsApi from "./api/TagApi";
import UnfurlApi from "./api/UnfurlApi";
import UsersApi from "./api/UserApi";
import VideosApi from "./api/VideoApi";
import {
  loginStrategy,
  SigninStrategy,
  studentSignupStrategy,
  teacherSignupStrategy,
} from "./auth/Auth";
import { logger } from "./backends/Logger";
import { knex } from "./database/connection";
import { createSession } from "./http/SessionStore";
import { clientApp, clientDir, publicDir } from "./Paths";

const DATABASE_URL = `postgresql://${process.env.CELLULOID_PG_USER}:${process.env.CELLULOID_PG_PASSWORD}@${process.env.CELLULOID_PG_HOST}:${process.env.CELLULOID_PG_PORT}/${process.env.CELLULOID_PG_DATABASE}`;



require("cookie-parser");

const log = logger("http");

passport.use(SigninStrategy.LOGIN, loginStrategy);
passport.use(SigninStrategy.TEACHER_SIGNUP, teacherSignupStrategy);
passport.use(SigninStrategy.STUDENT_SIGNUP, studentSignupStrategy);
const app = express();

app.use(express.static(publicDir));
app.use(express.static(clientDir));
app.use(bodyParser.json());
app.use(compression());
app.use(createSession());
app.use(expressPino({ logger: log }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/projects", ProjectsApi);
app.use("/api/users", UsersApi);
app.use("/api/tags", TagsApi);
app.use("/api/unfurl", UnfurlApi);
app.use("/api/video", VideosApi);

app.get("/elb-status", (_, res) => res.status(200).send());


// const RemoveQueryQueryPlugin: Plugin = (builder) => {
//   builder.hook("GraphQLObjectType:fields", (fields, build, context) => {
//     if (context.scope.isRootQuery) {
//       const { query, ...rest } = fields;
//       // Drop the `query` field
//       return rest;
//     } else {
//       return fields;
//     }
//   });
// };

// type PgConstraint = any;

// const PrimaryKeyMutationsOnlyPlugin: Plugin = (builder) => {
//   builder.hook(
//     "build",
//     (build) => {
//       build.pgIntrospectionResultsByKind.constraint.forEach(
//         (constraint: PgConstraint) => {
//           if (!constraint.tags.omit && constraint.type !== "p") {
//             constraint.tags.omit = ["update", "delete"];
//           }
//         }
//       );
//       return build;
//     },
//     [],
//     [],
//     ["PgIntrospection"]
//   );
// };


// app.use(
//   postgraphile(DATABASE_URL, "public", {
//     subscriptions: true,
//     watchPg: true,
//     dynamicJson: true,
//     setofFunctionsContainNulls: false,
//     ignoreRBAC: false,
//     showErrorStack: "json",
//     extendedErrors: ["hint", "detail", "errcode"],
//     appendPlugins: [
//       require("@graphile-contrib/pg-simplify-inflector"),
//       ConnectionFilterPlugin,
//       RemoveQueryQueryPlugin,
//       PrimaryKeyMutationsOnlyPlugin
//     ],
//     skipPlugins: [
//       // Disable the 'Node' interface
//       NodePlugin,
//     ],
//     sortExport: true,
//     exportGqlSchemaPath: "schema.graphql",
//     graphiql: true,
//     enhanceGraphiql: true,
//     allowExplain() {
//       return true;
//     },
//     enableQueryBatching: true,
//     legacyRelations: "omit",
//     pgSettings: async () => {
//       // const authorization = req.headers.authorization;
//       // const bearerStr = "Bearer";
//       // if (canSplit(authorization, bearerStr)) {
//       //   const token = authorization.split(bearerStr);
//       //   if (token.length > 1) {
//       //     try {
//       //       const user = await keycloak.verifyOnline(token[1]);
//       //       const role = user.resourceAccess.web.roles[0];
//       //       const id = user.id.split(":")[2];

//       //       return {
//       //         "jwt.claims.user_id": id,
//       //         "jwt.claims.role": role,
//       //       };
//       //     } catch (e) {}
//       //   }
//       // }

//       return {
//         role: "celluloid",
//       };
//     },
//   })
// );

app.get("/*", (_, res) => res.sendFile(clientApp));

(async () => {
  try {
    log.info("Migration started...");
    await knex.migrate.latest();
    await knex.seed.run();
    log.info("Migration finished...");

    app.listen(process.env.CELLULOID_LISTEN_PORT, () => {
      log.info(
        `HTTP server listening on port ${process.env.CELLULOID_LISTEN_PORT}` +
          ` in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (err) {
    log.error(err);
  }
})();
