"use client";

import Link from "next/link";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";
import { getAllPosts } from "@/lib/blog/posts";
import { Calendar, Clock } from "lucide-react";

export default function BlogPage() {
  const showHeader = useShouldShowHeader();
  const posts = getAllPosts();

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
          <div className="relative">
            {/* Hero */}
            <section className="w-full border-b border-white/10 bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  QR Code <span className="text-emerald-400">Blog</span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Guides, tips, and best practices for using QR codes effectively.
                </p>
              </div>
            </section>

            {/* Post list */}
            <section className="w-full bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl">
                <ul className="space-y-10">
                  {posts.map((post) => (
                    <li
                      key={post.slug}
                      className="border-b border-white/10 pb-10 last:border-0 last:pb-0 first:pt-0"
                    >
                      <article>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group block"
                        >
                          <h2 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-emerald-400 sm:text-2xl">
                            {post.title}
                          </h2>
                          <p className="mt-2 text-zinc-400">
                            {post.description}
                          </p>
                          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="size-4" aria-hidden />
                              <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </time>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="size-4" aria-hidden />
                              {post.readingTimeMinutes} min read
                            </span>
                          </div>
                        </Link>
                      </article>
                    </li>
                  ))}
                </ul>
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
