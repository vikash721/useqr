import type { ReactNode } from "react";
import { getPostBySlug } from "./posts";

function Prose({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`space-y-6 text-base [&>h2]:mt-10 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h2]:text-white [&>h2]:sm:text-2xl [&>p]:leading-relaxed [&>p]:text-zinc-400 [&_strong]:text-white [&_a]:text-emerald-400 [&_a]:no-underline hover:[&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_li]:text-zinc-400 [&_li]:leading-relaxed [&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_thead]:border-b [&_thead]:border-white/20 [&_th]:bg-white/5 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-zinc-300 [&_tbody_tr]:border-b [&_tbody_tr]:border-white/10 [&_tbody_tr:last-child]:border-0 [&_td]:px-4 [&_td]:py-3 [&_td]:text-sm [&_td]:text-zinc-400 [&_td]:leading-relaxed [&_.blog-table-wrap]:my-8 [&_.blog-table-wrap]:overflow-x-auto [&_.blog-table-wrap]:rounded [&_.blog-table-wrap]:border [&_.blog-table-wrap]:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

export function getPostContent(slug: string): ReactNode {
  const post = getPostBySlug(slug);
  if (!post) return null;

  switch (slug) {
    case "10-creative-ways-to-use-qr-codes-in-marketing":
      return <CreativeQRMarketingContent />;
    case "dynamic-vs-static-qr-codes":
      return <DynamicVsStaticContent />;
    case "qr-code-business-card-contact":
      return <BusinessCardContactContent />;
    case "qr-code-best-practices-print-digital":
      return <BestPracticesContent />;
    default:
      return null;
  }
}

function CreativeQRMarketingContent() {
  return (
    <Prose>
      <p>
        QR codes have become a powerful bridge between the physical and digital
        worlds. Whether you&apos;re running a small business or managing
        enterprise campaigns, a well-placed QR code can drive traffic, boost
        engagement, and create memorable customer experiences. Here are ten
        creative ways to put QR codes to work in your marketing.
      </p>

      <h2>1. Product packaging that tells a story</h2>
      <p>
        Add a QR code to your product packaging that links to a video showing
        how the product is made, sourced, or best used. Customers get richer
        context, and you get a chance to build brand loyalty beyond the shelf.
        With a <strong>dynamic QR code</strong>, you can swap the video for
        seasonal content or updated tutorials without changing the packaging.
      </p>

      <h2>2. Interactive restaurant menus</h2>
      <p>
        Replace or supplement printed menus with a QR code on each table. Diners
        scan and see your full menu with photos, allergen info, and daily
        specials. Update prices or items instantly from your dashboard—no
        reprinting needed. This is one of the most popular
        <strong> QR code use cases</strong> in hospitality.
      </p>

      <h2>3. Event check-in and engagement</h2>
      <p>
        Use QR codes on event tickets or badges for instant check-in. Beyond
        entry, link attendees to schedules, speaker bios, feedback forms, or
        exclusive content. Track scan data to see which sessions are generating
        the most interest and adjust your event strategy in real time.
      </p>

      <h2>4. Business cards that never go out of date</h2>
      <p>
        A <strong>vCard QR code</strong> on your business card lets people save
        your contact details with one scan. Use a dynamic code so you can update
        your phone number, email, or job title without ordering new cards.
        It&apos;s networking, modernized.
      </p>

      <h2>5. Print ads with measurable results</h2>
      <p>
        Traditional print advertising—magazines, flyers, billboards—has always
        struggled with attribution. Add a QR code that links to a dedicated
        landing page and you can track exactly how many people engaged with your
        ad. Use <strong>QR code analytics</strong> to measure impressions,
        scans, and conversions from every placement.
      </p>

      <h2>6. Loyalty programs and coupons</h2>
      <p>
        Place QR codes on receipts, shopping bags, or in-store displays that
        link to loyalty sign-ups, discount codes, or exclusive offers. Customers
        get instant value, and you capture leads and build your CRM database.
        Rotate offers by updating the QR destination—same code, fresh deals.
      </p>

      <h2>7. Real estate listings</h2>
      <p>
        Put a QR code on &quot;For Sale&quot; signs, flyers, or window displays.
        Prospective buyers scan and get instant access to a virtual tour, floor
        plans, pricing details, and your contact information. It turns a passive
        sign into an interactive listing and captures leads 24/7.
      </p>

      <h2>8. Social media growth</h2>
      <p>
        Create a QR code that links to your social media profiles or a
        &quot;link-in-bio&quot; page. Place it on packaging, business cards,
        receipts, or at your counter. It&apos;s a frictionless way to convert
        offline interactions into online followers. Track which physical
        placements drive the most follows.
      </p>

      <h2>9. Feedback and reviews</h2>
      <p>
        Make it easy for customers to leave feedback by placing a QR code on
        receipts, packaging, or at checkout that links directly to a review form
        or your Google Business listing. The fewer steps between &quot;I had a
        great experience&quot; and &quot;I left a review,&quot; the more reviews
        you&apos;ll collect. Positive reviews also improve your local SEO.
      </p>

      <h2>10. Educational and how-to content</h2>
      <p>
        Link QR codes on products, manuals, or in-store displays to how-to
        videos, setup guides, or FAQs. This reduces support requests and
        improves customer satisfaction. For example, a furniture company can
        place a QR code on the box that links to an assembly video.
      </p>

      <h2>Make your QR codes work harder</h2>
      <p>
        The key to success with QR code marketing is making every scan
        worthwhile. Use <strong>custom QR codes with your logo</strong> and
        brand colors so they&apos;re recognizable. Always add a short
        call-to-action near the code—&quot;Scan for 20% off,&quot; &quot;Scan
        to watch,&quot; or &quot;Scan to save my contact.&quot; And use a
        platform like <strong>UseQR</strong> that gives you dynamic codes,
        real-time analytics, and the ability to update your content without
        reprinting. One code, endless possibilities.
      </p>
    </Prose>
  );
}

function DynamicVsStaticContent() {
  return (
    <Prose>
      <p>
        Not all QR codes are the same. <strong>Static QR codes</strong> point
        to a fixed URL or text—once printed, they can&apos;t be changed.
        <strong> Dynamic QR codes</strong> point to a short link or dashboard
        where you can update the destination anytime without reprinting. For
        most businesses and personal use, dynamic (editable) QR codes are the
        better choice.
      </p>

      <h2>What is a static QR code?</h2>
      <p>
        A static QR code encodes the final destination directly into the
        pattern. If your code encodes &quot;https://yoursite.com/promo&quot;,
        that&apos;s the only place it will ever send users. To change it, you
        must create a new code and reprint or re-publish. Static codes are
        simple and don&apos;t require a backend—but they&apos;re inflexible.
      </p>

      <h2>What is a dynamic QR code?</h2>
      <p>
        A dynamic QR code encodes a short URL that redirects to your real
        destination. When you scan it, the redirect is looked up on a server, so
        you can change where it goes at any time. The same printed code can
        point to a winter sale today and a spring campaign next month. You get
        analytics, A/B testing, and the ability to fix typos or broken links
        without reprinting.
      </p>

      <h2>When to use static vs dynamic</h2>
      <p>
        Use <strong>static</strong> when the content will never change and you
        don&apos;t need tracking—e.g. a permanent link to a single PDF or a
        fixed WiFi password. Use <strong>dynamic</strong> when you might update
        the destination, run campaigns, or care about scan counts. For business
        cards, menus, flyers, and product packaging, dynamic QR codes usually
        save time and money and give you more control.
      </p>

      <div className="blog-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Static QR</th>
              <th>Dynamic QR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Edit destination after printing</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Analytics / scan counts</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Backend / service required</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
            <tr>
              <td>Best for</td>
              <td>Fixed links, WiFi, one-off use</td>
              <td>Business cards, menus, campaigns, contact</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Why editable QR codes win for business</h2>
      <p>
        Editable (dynamic) QR codes let you reuse one design across print and
        digital. Update a broken link, swap a landing page, or point to a new
        offer—all without new stickers or reprints. You also get insight into
        how often and where people scan, which helps with marketing and
        placement decisions. UseQR is built around this idea: one code, any
        content, yours forever.
      </p>
    </Prose>
  );
}

function BusinessCardContactContent() {
  return (
    <Prose>
      <p>
        Putting your contact details in a QR code makes it easy for people to
        save your name, phone, email, and company with one scan—no typing or
        manual entry. You can use it on business cards, stickers, keychains,
        or lost-and-found tags. Here&apos;s how to create and use a contact QR
        code effectively.
      </p>

      <h2>Why use a QR code for your contact?</h2>
      <p>
        A contact QR code (often using the vCard format) lets anyone scan and
        add you to their phone&apos;s contacts instantly. It&apos;s faster than
        exchanging cards and typing details, and it works for networking,
        events, and anything you put your info on—bags, keys, gear—so people can
        reach you if they find it.
      </p>

      <h2>What to include in your contact QR</h2>
      <p>
        Keep it accurate and professional. If you use a dynamic QR code (like
        with UseQR), you can update this information anytime without changing
        the printed code.
      </p>

      <div className="blog-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Include?</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Name</td>
              <td>Yes</td>
              <td>Full name or how you want to be saved</td>
            </tr>
            <tr>
              <td>Phone</td>
              <td>Yes</td>
              <td>Primary number for call / text</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>Yes</td>
              <td>Primary email for contact</td>
            </tr>
            <tr>
              <td>Company &amp; title</td>
              <td>Optional</td>
              <td>Helpful for business cards and networking</td>
            </tr>
            <tr>
              <td>Website</td>
              <td>Optional</td>
              <td>Portfolio, LinkedIn, or company URL</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Where to use it</h2>
      <p>
        Print it on business cards, add it to email signatures or LinkedIn, or
        stick it on items you might lose. For lost-and-found, a small sticker
        with &quot;Scan to contact owner&quot; and your contact QR can help
        someone return your keys or bag. One code can sit on cards, stickers,
        and digital assets—and you can change the contact details behind it
        whenever needed.
      </p>

      <h2>Getting started with UseQR</h2>
      <p>
        With UseQR, you create a custom QR code, set the content to your
        contact (vCard), style it to match your brand, and download or order
        print. The same code stays valid even if you change your phone number
        or email later—update it once in the dashboard and every scan reflects
        the new info.
      </p>
    </Prose>
  );
}

function BestPracticesContent() {
  return (
    <Prose>
      <p>
        A QR code only works if people can scan it quickly and reliably. Size,
        contrast, placement, and testing all matter—whether you&apos;re printing
        flyers, packaging, or showing codes on screens. Follow these best
        practices so your QR codes perform well in the real world.
      </p>

      <h2>Size and minimum dimensions</h2>
      <p>
        QR codes need a minimum size so cameras can resolve the modules. Use
        the guidelines below and scale up when the code is viewed from farther
        away.
      </p>

      <div className="blog-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Use case</th>
              <th>Minimum size</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Business cards, labels</td>
              <td>2 cm × 2 cm (0.8 in)</td>
              <td>Close-range scan; 2.5–3 cm is more comfortable</td>
            </tr>
            <tr>
              <td>Flyers, packaging</td>
              <td>2.5–3 cm</td>
              <td>Room for quiet zone; avoid tiny corners</td>
            </tr>
            <tr>
              <td>Posters, signage</td>
              <td>Scale with distance</td>
              <td>Code must be readable from where people stand</td>
            </tr>
            <tr>
              <td>Screens / digital</td>
              <td>200×200 px or larger</td>
              <td>Test on real devices; smaller can work on mobile</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Contrast and quiet zone</h2>
      <p>
        High contrast between the code and its background is essential—dark
        modules on a light background or light on dark. Avoid busy patterns or
        photos behind the code. Leave a <strong>quiet zone</strong> (white or
        empty margin) around the QR code; don&apos;t crowd it with text or
        graphics. One module width of clear space is the minimum; a bit more
        improves scan success.
      </p>

      <h2>Placement and context</h2>
      <p>
        Put the code where people naturally look and where they have a moment to
        scan—e.g. bottom of a flyer, corner of a package, or on a sign at eye
        level. Add a short line of copy: &quot;Scan for menu,&quot; &quot;Scan
        to save our contact,&quot; or &quot;Scan for more info.&quot; That
        clarifies intent and improves engagement.
      </p>

      <h2>Test before you print or publish</h2>
      <p>
        Always test with multiple phones and in the same conditions as your
        audience—same distance, lighting, and surface (e.g. matte vs glossy).
        Verify that the link or content loads correctly and that the code
        isn&apos;t distorted, cropped, or too small. A quick test print or
        on-screen preview can prevent costly reprints or low scan rates.
      </p>

      <h2>Print quality and resolution</h2>
      <p>
        Use a high-resolution export so the QR code prints sharply. Blurry or
        pixelated codes are harder to scan. For large-format printing, scale
        the asset proportionally and ensure the file is at least 300 DPI (or as
        required by your printer). UseQR lets you download high-resolution
        assets suitable for print and digital use.
      </p>

      <h2>Quick reference</h2>
      <div className="blog-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Practice</th>
              <th>Do</th>
              <th>Avoid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Contrast</td>
              <td>Dark on light or light on dark</td>
              <td>Busy backgrounds, low contrast</td>
            </tr>
            <tr>
              <td>Quiet zone</td>
              <td>Clear margin around the code</td>
              <td>Text or graphics touching the code</td>
            </tr>
            <tr>
              <td>Placement</td>
              <td>Where people look + short CTA</td>
              <td>Hidden corners, no context</td>
            </tr>
            <tr>
              <td>Testing</td>
              <td>Multiple devices, real conditions</td>
              <td>Publishing without testing</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Prose>
  );
}
