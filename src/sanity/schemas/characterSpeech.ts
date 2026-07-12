import { defineType, defineField } from "sanity";

export const characterSpeech = defineType({
  name: "characterSpeech",
  title: "Character speech bubbles",
  type: "document",
  fields: [
    defineField({ name: "variantsPeek", type: "string", title: "Variants section character peek line" }),
    defineField({ name: "shopPeek", type: "string", title: "Shop section character peek line" }),
    defineField({ name: "dividerSay", type: "string", title: "Character divider speech" }),
  ],
});
