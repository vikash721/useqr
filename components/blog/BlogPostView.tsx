"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";
import type { BlogPostMeta } from "@/lib/blog/types";

type BlogPostViewProps = {
  post: BlogPostMeta;
  content: React.ReactNode;
};

export function BlogPostView({ post, content }: BlogPostViewProps) {
  const showHeader = useShouldShowHeader();
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      {showHeader ? (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
      ) : (
        <LandingHeader />
      )}
      <main className="relative flex-1">
        {!showHeader ? (
          <div className="relative w-full bg-black">
            <div className="border-b border-white/10 px-6 py-4">
              <div className="mx-auto max-w-3xl">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
                >
                  <ArrowLeft className="size-4" />
                  Back to blog
                </Link>
              </div>
            </div>

            <article className="px-6 py-12 lg:py-16">
              <div className="mx-auto max-w-3xl">
                <header>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {post.title}
                  </h1>
                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4" aria-hidden />
                      <time dateTime={post.date}>{formattedDate}</time>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden />
                      {post.readingTimeMinutes} min read
                    </span>
                    <span>
                      {post.author}
                      {post.authorRole ? ` · ${post.authorRole}` : ""}
                    </span>
                  </div>
                </header>

                <div className="mt-10">{content}</div>
              </div>
            </article>

            <section className="border-t border-white/10 px-6 py-16 lg:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Ready to create your own QR code?
                </h2>
                <p className="mt-4 text-zinc-400">
                  One code. Any content. Yours forever.
                </p>
                <div className="mt-8">
                  <Link
                    href="/"
                    className="inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    Get started free
                  </Link>
                </div>
              </div>
            </section>

            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-zinc-400">Blog</p>
          </div>
        )}
      </main>
    </>
  );
}
