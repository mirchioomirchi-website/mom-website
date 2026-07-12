import { defineType, defineField } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero (top of homepage)",
  type: "document",
  // Singleton — only one hero ever exists.
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow words (top tiny text)",
      description: 'Three short words above the headline, e.g. "Handcrafted Indian Thecha"',
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.min(2).max(4),
    }),
    defineField({
      name: "headingTop",
      title: "Heading — top word",
      type: "string",
      initialValue: "Mirchi",
    }),
    defineField({
      name: "headingMid",
      title: "Heading — middle word",
      type: "string",
      initialValue: "O",
    }),
    defineField({
      name: "headingBottom",
      title: "Heading — bottom word",
      type: "string",
      initialValue: "Mirchi",
    }),
    defineField({
      name: "tagline",
      title: "Tagline (under headline)",
      type: "string",
      initialValue: "Bold Flavour. Real Thecha. Small Batches.",
    }),
    defineField({
      name: "ctaPrimaryLabel",
      title: "Primary button label",
      type: "string",
      initialValue: "Shop Now",
    }),
    defineField({
      name: "ctaSecondaryLabel",
      title: "Secondary button label",
      type: "string",
      initialValue: "Flavours",
    }),
  ],
  preview: { select: { title: "tagline" }, prepare: ({ title }) => ({ title: "Hero", subtitle: title }) },
});
