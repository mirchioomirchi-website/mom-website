import { defineType, defineField } from "sanity";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "newsletter",
      type: "object",
      fields: [
        { name: "heading", type: "string", initialValue: "Stay spicy." },
        { name: "body", type: "text" },
        { name: "placeholder", type: "string", initialValue: "your@email.com" },
        { name: "cta", type: "string", initialValue: "Subscribe" },
      ],
    }),
    defineField({
      name: "brand",
      type: "object",
      fields: [
        { name: "title", type: "string", initialValue: "Mirchi O Mirchi" },
        { name: "tagline", type: "text", description: "Use newlines for stacked layout" },
      ],
    }),
    defineField({ name: "legal", type: "string", initialValue: "© Mirchi O Mirchi. All rights reserved." }),
  ],
});
