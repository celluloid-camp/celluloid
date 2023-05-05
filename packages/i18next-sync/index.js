var colors = require("colors");
const i18nTransform = require("i18next-parser").transform;
var sort = require("gulp-sort");
var vfs = require("vinyl-fs");
const { GoogleSpreadsheet } = require("google-spreadsheet");
var creds = require("./edit-google-spreadsheets.json");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const map = require("map-stream");
const { difference } = require("lodash");

const SPREADSHEET_TITLE = "Translations";
const SPREADSHEET_ID = "1gp65aIFlL5x2K8znQ81WjDbXgVtRiCJ9fLCNPw2gYF0";

console.log("Working directory:", __dirname);

const LOCALES_FOLDER = path.resolve(__dirname, "../client/src/locales");
const globs = path.resolve(process.cwd(), "../client/src/**/*.{ts,tsx}");

// Spreadsheet from https://docs.google.com/spreadsheets/d/1gp65aIFlL5x2K8znQ81WjDbXgVtRiCJ9fLCNPw2gYF0/edit#gid=0
async function main() {
  var doc = new GoogleSpreadsheet(SPREADSHEET_ID);
  try {
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
  } catch (e) {
    console.log(e.message);
    return null;
  }

  const sheet = doc.sheetsByTitle[SPREADSHEET_TITLE];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  // remove the first key column
  sheet.headerValues.shift();
  const locales = sheet.headerValues;
  // map keys by namespace and locale : [en,se,no,fi]
  let namespaces = {};
  const sheetKeys = [];
  rows.forEach((row) => {
    if (!row.key) {
      console.log("key missin for row:", row);
    }
    const ns = row.key.split(":")[0];
    const key = row.key.split(":")[1];
    sheetKeys.push(row.key);

    if (!namespaces[ns]) {
      locales.forEach((l) => {
        namespaces[ns] = { ...namespaces[ns], [l]: {} };
      });
    }

    locales.forEach((l) => {
      namespaces = {
        ...namespaces,
        [ns]: {
          ...namespaces[ns],
          [l]: {
            ...namespaces[ns][l],
            [key]: row[l] || "",
          },
        },
      };
    });
  });

  // create folders if doens't exists
  locales.forEach(async (l) => {
    await mkdirp(path.resolve(LOCALES_FOLDER, l));
  });
  console.log("LOCALES_FOLDER", LOCALES_FOLDER);
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
  const extracted = await extractTranslationFromCode(locales);
  let trans = {};
  // we use english as reference
  Object.keys(extracted).forEach((n) =>
    Object.keys(extracted[n]["en"]).forEach(
      (k) => (trans = { ...trans, [`${n}:${k}`]: extracted[n]["en"][k] || "" })
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
          .on("reading", (file) => {
            count++;
          })
          .on("error", (message, region) => {
            if (typeof region === "string") {
              message += ": " + region.trim();
            }
            console.log("  [error]   ".red + message);
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
