// Aggregator for all Sanity schema types — referenced from sanity.config.ts.
//
// To add a new editable section in admin: create a new file here, define a
// schema, then add it to this array. The next deploy gives you the new editor.

import { hero } from "./hero";
import { meetMOM } from "./meetMOM";
import { ingredients } from "./ingredients";
import { quality } from "./quality";
import { story } from "./story";
import { shop } from "./shop";
import { footer } from "./footer";
import { characterSpeech } from "./characterSpeech";
import { marquee } from "./marquee";
import { blogPost } from "./blogPost";

export const schemaTypes = [
  hero,
  meetMOM,
  ingredients,
  quality,
  story,
  shop,
  footer,
  characterSpeech,
  marquee,
  blogPost,
];
