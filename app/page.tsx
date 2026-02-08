import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

/**
 * Home page — Server Component. Renders the landing UI via HomeClient (SSR'd for SEO).
 * Card thank-you and dashboard are not intended for ranking (noindex already set).
 * HomeClient uses useSearchParams (e.g. to skip dev toast when view=am), so it must be in Suspense for prerender.
 */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
