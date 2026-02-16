import { init } from "@paralleldrive/cuid2";

// generate a unique id of length 16
export const generateId = init({
    length: 16,
});
