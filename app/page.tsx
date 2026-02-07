import HomeClient from "@/components/HomeClient";

/**
 * Home page — Server Component. Renders the landing UI via HomeClient (SSR'd for SEO).
 * Card thank-you and dashboard are not intended for ranking (noindex already set).
 */
export default function Home() {
  return <HomeClient />;
}
