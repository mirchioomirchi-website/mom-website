import { defineType, defineField } from "sanity";

export const story = defineType({
  name: "story",
  title: "Story (grandmother's recipe)",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "The Story" }),
    defineField({ name: "heading", type: "string", initialValue: "Our grandmother's thecha recipe." }),
    defineField({
      name: "stats",
      title: "Stats row (3 numbers)",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "value", type: "string", title: "Number (e.g. '7' or '100%')" },
            { name: "label", type: "string", title: "Label below" },
            { name: "color", type: "string", title: "Tailwind color class (e.g. 'text-mom-pink')" },
          ],
        },
      ],
      validation: (Rule) => Rule.length(3),
    }),
  ],
});
