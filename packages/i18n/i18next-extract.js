/* eslint-disable @typescript-eslint/no-var-requires */
var colors = require("colors");
const i18nTransform = require("i18next-parser").transform;
var sort = require("gulp-sort");
var vfs = require("vinyl-fs");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const map = require("map-stream");
const { difference } = require("lodash");

const { JWT } = require("google-auth-library");

const SPREADSHEET_TITLE = "Translations";

const LOCALES = ["fr", "en"];

const LOCALES_FOLDER = path.resolve(
  process.cwd(),
  "../../apps/frontend/src/locales"
);
const globs = path.resolve(
  process.cwd(),
  "../../apps/frontend/src/**/*.{ts,tsx}"
);

// Validate environment variables
function validateEnvVariable(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  console.log("Working directory:", process.cwd());

  const googleServiceAccountEmail = validateEnvVariable(
    "GOOGLE_SERVICE_ACCOUNT_EMAIL"
  );
  const googlePrivateKey = validateEnvVariable("GOOGLE_PRIVATE_KEY");
  const googleSpreadsheetId = validateEnvVariable("GOOGLE_SPREADSHEET_ID");

  const serviceAccountAuth = new JWT({
    email: googleServiceAccountEmail,
    key: googlePrivateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  var doc = new GoogleSpreadsheet(googleSpreadsheetId, serviceAccountAuth);
  try {
    await doc.loadInfo();
  } catch (e) {
    console.log(e);
    return null;
  }

  const sheet = doc.sheetsByTitle[SPREADSHEET_TITLE];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  // remove the first key column
  // sheet.headerValues.shift();

  // map keys by namespace and locale : [en,se,no,fi]
  let namespaces = {};
  const sheetKeys = [];
  rows.forEach((row) => {
    const rowKey = row.get("key");
    const ns = rowKey.split(":")[0];
    const key = rowKey.split(":")[1];
    sheetKeys.push(rowKey);

    if (!namespaces[ns]) {
      LOCALES.forEach((l) => {
        namespaces[ns] = { ...namespaces[ns], [l]: {} };
      });
    }

    LOCALES.forEach((l) => {
      namespaces = {
        ...namespaces,
        [ns]: {
          ...namespaces[ns],
          [l]: {
            ...namespaces[ns][l],
            [key]: row.get(l) || "",
          },
        },
      };
    });
  });

  // create folders if doens't exists
  LOCALES.forEach(async (l) => {
    await mkdirp(path.resolve(LOCALES_FOLDER, l));
  });
  // 2 - remplace translations in src/locales/[locale]/[ns].json
  Object.keys(namespaces).forEach((n) => {
    Object.keys(namespaces[n]).forEach(async (l) => {
      fs.writeFileSync(
        path.resolve(LOCALES_FOLDER, l, `${n}.json`),
        JSON.stringify(namespaces[n][l]),
        { flag: "w" }
      );
    });
  });

  // extract news keys from sources
  const extracted = await extractTranslationFromCode(LOCALES);

  console.log("extracted", extracted.l);
  let trans = {};
  // we use english as reference
  Object.keys(extracted).forEach((n) =>
    Object.keys(extracted[n]["fr"]).forEach(
      (k) => (trans = { ...trans, [`${n}:${k}`]: extracted[n]["fr"][k] || "" })
    )
  );

  const diff = difference(Object.keys(trans), sheetKeys);
  // 4 - upload new keys and default value to spreadsheet

  const newRows = diff.map((k) => [k, trans[k]]);
  await sheet.addRows(newRows);
  console.log("Sync:  ".cyan + newRows.length + " keys added");
}

function extractTranslationFromCode(locales) {
  var count = 0;
  let results = {};

  const config = {
    contextSeparator: "_",
    createOldCatalogs: false,
    keySeparator: false,
    defaultValue: "__TO_TRANSLATE__",
    namespaceSeparator: false,
    keepRemoved: false,
    locales,
    lexers: {
      ts: ["JavascriptLexer"],
      tsx: ["JsxLexer"],
      default: ["JavascriptLexer"],
    },
    useKeysAsDefaultValue: false,
    defaultNamespace: "common",
    skipDefaultValues: false,
  };

  return new Promise((resolve) => {
    vfs
      .src(globs)
      .pipe(sort())
      .pipe(
        new i18nTransform(config)
          .on("reading", () => {
            count++;
          })
          .on("error", (message, region) => {
            var error = message;
            if (typeof region === "string") {
              error += ": " + region.trim();
            }
            console.log("  [error]   ".red + error);
          })
          .on("warning", (message) => {
            console.log("  [warning] ".yellow + message);
          })
          .on("finish", () => {
            console.log("  Stats:  ".cyan + count + " files were parsed");
          })
      )
      .pipe(
        map((file, cb) => {
          const ns = file.stem;
          const l = path.dirname(file.relative).split(path.sep).pop();
          const raw = JSON.parse(file.contents.toString());

          results = {
            ...results,
            [ns]: {
              ...(results[ns] || {}),
              [l]: raw,
            },
          };
          cb(null, file);
        })
      )
      .on("end", () => {
        resolve(results);
      });
  });
}

(async function () {
  await main();
})().catch(console.error);
