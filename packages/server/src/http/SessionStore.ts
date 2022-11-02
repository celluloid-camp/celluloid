
import { Session, Store } from "express-session";
import moment from "moment";

import { database } from "../backends/Database";
import { logger } from "../backends/Logger";

const log = logger("http/Session");

const getExpiresAt = (session:Session) => {
  return moment()
    .add(session.cookie?.maxAge || 10 / 1000, "s")
    .toDate();
};

class PostgresStore extends Store {
  closed: boolean;
  pruneInterval: any;
  pruneTimer: any;
  // ttl: number;

  constructor(pruneInterval?: number) {
    super();
    this.closed = false;
    this.pruneInterval = pruneInterval || 60 * 1000; // 1 hour
    this.pruneTimer = setTimeout(
      this.pruneSessions.bind(this),
      this.pruneInterval
    );
    setImmediate(this.pruneSessions.bind(this));
  }

  get = (sid:string, callback:any) => {
    return database("Session")
      .first()
      .where("sid", sid)
      .then((result) => {
        if (result) {
          return Promise.resolve(callback(null, JSON.parse(result.session)));
        } else {
          return Promise.resolve(callback());
        }
      })
      .catch((error) => {
        log.error(`Failed to get session with sid [${sid}]:`, error);
        return Promise.resolve(callback(error));
      });
  };

  set = (sid:string, session:Session, callback:any) => {
    return database("Session")
      .select("sid")
      .where("sid", sid)
      .first()
      .then((result) => {
        if (!result) {
          return database("Session").insert({
            sid,
            session,
            expiresAt: getExpiresAt(session),
          });
        } else {
          return database("Session")
            .update({
              session,
              expiresAt: getExpiresAt(session),
            })
            .where("sid", sid);
        }
      })
      .then(() => {
        log.info(`Set session with sid [${sid}]`);
        if (callback) {
          return Promise.resolve(callback.apply(this, null));
        }
      })
      .catch((error) => {
        log.error(`Failed to set session with sid [${sid}]:`, error);
        if (callback) {
          return Promise.resolve(callback.apply(this, error));
        }
      });
  };

  destroy = (sid:string, callback:any) => {
    return database("Session")
      .del()
      .where("sid", sid)
      .then(() => {
        log.info(`Destroyed session with sid [${sid}]`);
        if (callback) {
          return Promise.resolve(callback.apply(this, null));
        }
      })
      .catch((error) => {
        log.error(`Failed to destroy session with sid [${sid}]:`, error);
        if (callback) {
          return Promise.resolve(callback.apply(this, error));
        }
      });
  };

  touch = (sid:string, session:Session, callback:any) => {
    return database("Session")
      .update({
        expiresAt: getExpiresAt(session),
      })
      .where("sid", sid)
      .then(() => {
        if (callback) {
          return Promise.resolve(callback.apply(this, null));
        }
      })
      .catch((error) => {
        log.error(`Failed to touch session with sid [${sid}]:`, error);
        if (callback) {
          return Promise.resolve(callback.apply(this, error));
        }
      });
  };

  pruneSessions() {
    database("Session")
      .del()
      .where("expiresAt", "<", moment().toDate())
      .then(() => {
        log.info("Sessions pruned");
      })
      .catch((error) => {
        log.info("Failed to prune sessions:", error);
      });
  }

  close() {
    this.closed = true;

    if (this.pruneTimer) {
      clearTimeout(this.pruneTimer);
      this.pruneTimer = undefined;
    }
  }
}

export function createStore(pruneInterval?: number) {
  return new PostgresStore(pruneInterval);
}
