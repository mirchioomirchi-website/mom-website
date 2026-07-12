import { defineType, defineField } from "sanity";

export const shop = defineType({
  name: "shop",
  title: "Shop section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "Shop" }),
    defineField({ name: "heading", type: "string", initialValue: "Grab your jar." }),
    defineField({
      name: "trustSignals",
      title: "Trust signals (small text below cards)",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
