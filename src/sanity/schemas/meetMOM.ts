import { defineType, defineField } from "sanity";

export const meetMOM = defineType({
  name: "meetMOM",
  title: "Meet MOM (3 character avatars)",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", type: "string", initialValue: "Meet MOM" }),
    defineField({
      name: "headingHtml",
      title: "Heading (HTML allowed)",
      type: "text",
      description: "Wrap colored words in <em class='text-mom-pink'>...</em> or <em class='text-mom-orange'>...</em>",
    }),
    defineField({ name: "body", title: "Body paragraph", type: "text" }),
    defineField({
      name: "characters",
      title: "3 characters",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", type: "string", title: "Name" },
            { name: "trait", type: "string", title: "Trait line" },
            { name: "image", type: "image", title: "Character image", options: { hotspot: true } },
            { name: "bg", type: "string", title: "Background hex (e.g. #CDDC39)" },
          ],
        },
      ],
      validation: (Rule) => Rule.length(3),
    }),
  ],
});
