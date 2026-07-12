import { defineType, defineField } from "sanity";

export const marquee = defineType({
  name: "marquee",
  title: "Marquee (scrolling text strip)",
  type: "document",
  fields: [
    defineField({
      name: "items",
      title: "Items (each separated by 🌶️ on the strip)",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
