import { defineType, defineField } from "sanity";

export const quality = defineType({
  name: "quality",
  title: "Quality (Real vs Fake table)",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "The Difference" }),
    defineField({ name: "heading", type: "string", initialValue: "Real vs. Fake." }),
    defineField({ name: "subheading", type: "text" }),
    defineField({
      name: "rows",
      title: "Comparison rows",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "feature", type: "string", title: "Feature (e.g. 'Ingredients')" },
            { name: "mom", type: "string", title: "MOM column value" },
            { name: "others", type: "string", title: "Others column value" },
          ],
        },
      ],
    }),
  ],
});
