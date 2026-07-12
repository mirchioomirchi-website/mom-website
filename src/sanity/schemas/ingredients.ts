import { defineType, defineField } from "sanity";

export const ingredients = defineType({
  name: "ingredients",
  title: "Ingredients (what's inside)",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "What's Inside" }),
    defineField({ name: "heading", type: "string", initialValue: "Six real ingredients." }),
    defineField({
      name: "items",
      title: "Ingredient cards",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "n", type: "string", title: "Number (01, 02, ...)" },
            { name: "name", type: "string", title: "Ingredient name" },
            { name: "description", type: "text", title: "Description" },
            { name: "image", type: "image", title: "Image", options: { hotspot: true } },
            { name: "color", type: "string", title: "Accent color (hex)" },
          ],
        },
      ],
    }),
    defineField({
      name: "footerHtml",
      title: "Bottom statement (HTML allowed)",
      type: "text",
      description: "Wrap highlighted text in <em class='text-white not-italic'>...</em>",
    }),
  ],
});
