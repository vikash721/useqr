import type { BlogPostMeta } from "./types";

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "dynamic-vs-static-qr-codes",
    title: "Dynamic vs Static QR Codes: Which Is Better for Your Business?",
    description:
      "Learn the key differences between dynamic and static QR codes, when to use each, and why editable QR codes save time and money for businesses.",
    date: "2025-02-09",
    author: "UseQR Team",
    authorRole: "Product",
    keywords: [
      "dynamic QR code",
      "static QR code",
      "editable QR code",
      "QR code for business",
      "reusable QR code",
    ],
    readingTimeMinutes: 6,
  },
  {
    slug: "qr-code-business-card-contact",
    title: "How to Create a QR Code for Your Business Card or Contact",
    description:
      "Step-by-step guide to putting your contact info in a QR code for business cards, lost-and-found, and networking. One scan, instant save.",
    date: "2025-02-08",
    author: "UseQR Team",
    authorRole: "Product",
    keywords: [
      "QR code business card",
      "vCard QR code",
      "contact QR code",
      "digital business card",
      "QR code contact",
    ],
    readingTimeMinutes: 5,
  },
  {
    slug: "qr-code-best-practices-print-digital",
    title: "QR Code Best Practices for Print and Digital",
    description:
      "Size, placement, contrast, and testing tips so your QR codes scan reliably on flyers, packaging, screens, and signs.",
    date: "2025-02-07",
    author: "UseQR Team",
    authorRole: "Product",
    keywords: [
      "QR code best practices",
      "QR code size",
      "QR code print",
      "QR code design",
      "scan reliability",
    ],
    readingTimeMinutes: 7,
  },
];

export function getAllPosts(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
