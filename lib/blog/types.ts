export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  author: string;
  authorRole?: string;
  keywords: string[];
  readingTimeMinutes: number;
  image?: string;
};
