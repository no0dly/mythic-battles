import { router, publicProcedure } from "../trpc";

type CardItem = {
  id: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
};

// Temporary in-memory data. Replace with DB/Supabase later if needed.
const cards: CardItem[] = [
  {
    id: "zeus",
    title: "Zeus",
    imageUrl: "/globe.svg",
    shortDescription: "King of the gods, wielder of thunder.",
    longDescription:
      "Zeus rules from Mount Olympus. In battle, he commands thunder and lightning, striking fear into the hearts of his enemies.",
  },
  {
    id: "ares",
    title: "Ares",
    imageUrl: "/logo.svg",
    shortDescription: "God of war, relentless and fierce.",
    longDescription:
      "Ares thrives in the chaos of combat. His presence emboldens allies and demoralizes foes with unmatched ferocity.",
  },
  {
    id: "athena",
    title: "Athena",
    imageUrl: "/window.svg",
    shortDescription: "Goddess of wisdom and strategy.",
    longDescription:
      "Athena balances intellect with martial skill, excelling at tactics, defense, and decisive strikes when opportunities arise.",
  },
];

export const cardsRouter = router({
  list: publicProcedure.query(() => cards),
});


