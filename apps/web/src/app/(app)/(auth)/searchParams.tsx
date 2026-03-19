import { createLoader, parseAsString } from "nuqs/server";

export const joinSearchParams = {
  code: parseAsString,
};

export const loadSearchParams = createLoader(joinSearchParams);
