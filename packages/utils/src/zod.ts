import { z } from "zod";

export function envBoolean(params: {
  optional: boolean;
  defaultValue: boolean;
}) {
  type BoolEnum = ["true", "false"];
  let variable: z.ZodCatch<z.ZodEnum<BoolEnum>> | z.ZodEnum<BoolEnum>;

  if (params.optional) {
    // if undefined assign the defaultValue
    variable = z
      .enum(["true", "false"])
      .catch(params.defaultValue ? "true" : "false");
  } else {
    // not optional so "true" or "false" is enforced
    variable = z.enum(["true", "false"]);
  }

  // convert string to bool
  return variable.transform((v) => v === "true");
}
