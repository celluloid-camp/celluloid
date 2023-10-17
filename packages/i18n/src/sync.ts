import fs from "fs";
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from "google-spreadsheet";
import sort from "gulp-sort";
import { transform as i18nTransform } from "i18next-parser";
import _ from "lodash";
// import map from "map-stream";
import { mkdirp } from "mkdirp";
import path from "path";
import vfs from "vinyl-fs";

// https://docs.google.com/spreadsheets/d/1gp65aIFlL5x2K8znQ81WjDbXgVtRiCJ9fLCNPw2gYF0/edit#gid=0
const SPREADSHEET_TITLE = "Translations";
const SPREADSHEET_ID = "1gp65aIFlL5x2K8znQ81WjDbXgVtRiCJ9fLCNPw2gYF0";


const LOCALES = ["fr", "en"];

const LOCALES_FOLDER = path.resolve(__dirname, "../../../apps/frontend/src/locales");
const globs = path.resolve(__dirname, "../../../apps/frontend/src/**/*.{ts,tsx}");

interface Namespace {
  [key: string]: any;
}

async function main(): Promise<void | null> {

  console.log("Working directory:", __dirname);
  console.log("Source folder", globs);

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
  try {
    await doc.loadInfo();
    console.log("Googlespreadhseet title:", doc.title);
  } catch (e) {
    console.log(e);
    return null;
  }


  const sheet = doc.sheetsByTitle[SPREADSHEET_TITLE];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();

  console.log("Googlespreadhseet row founds:", rows.length);

  let namespaces: Record<string, Record<string, Namespace>> = {};
  const sheetKeys: string[] = [];

  rows.forEach((row) => {
    const rowKey = row.get("key")
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

  console.log("Creating locales folders if doesn't exists");

  for (const l of LOCALES) {
    await mkdirp(path.resolve(LOCALES_FOLDER, l));
  }

  console.log("Writing remote translations");
  for (const n in namespaces) {
    for (const l in namespaces[n]) {
      fs.writeFileSync(
        path.resolve(LOCALES_FOLDER, l, `${n}.json`),
        JSON.stringify(namespaces[n][l]),
        { flag: "w" }
      );
    }
  }

  console.log("Extract local transations from code ");
  const extracted = await extractTranslationFromCode();
  let trans: Record<string, string> = {};

  console.log("Record extract", extracted.length);

  for (const n in extracted) {
    for (const k in extracted[n]["en"]) {
      trans = { ...trans, [`${n}:${k}`]: extracted[n]["en"][k] || "" };
    }
  }

  const diff = _.difference(Object.keys(trans), sheetKeys);
  const newRows = diff.map((k) => [k, trans[k]]);
  await sheet.addRows(newRows);
  console.log(`Sync:  ${newRows.length} keys added`);
}

function extractTranslationFromCode(): Promise<Record<string, any>> {
  const config = {
    contextSeparator: "_",
    createOldCatalogs: false,
    keySeparator: false,
    defaultValue: "__TO_TRANSLATE__",
    namespaceSeparator: false,
    keepRemoved: false,
    locales: LOCALES,
    lexers: {
      ts: ["JavascriptLexer"],
      tsx: ["JsxLexer"],
      default: ["JavascriptLexer"],
    },
    useKeysAsDefaultValue: false,
    defaultNamespace: "common",
    skipDefaultValues: false,
  };

  return new Promise(() => {
    vfs
      .src([globs])
      .pipe(sort())
      .pipe(
        new i18nTransform(config)
        // ...
      )
    // ...
  });
}

(async () => {
  await main();
})().catch(console.error);
