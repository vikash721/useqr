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
