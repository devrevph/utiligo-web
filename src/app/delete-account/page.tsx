import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Your Account — Utiligo",
  description:
    "How to permanently delete your Utiligo account and data, in-app or by request.",
};

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-tint font-mono text-[13px] font-semibold text-accent">
        {n}
      </span>
      <span className="pt-0.5 text-muted">{children}</span>
    </li>
  );
}

export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-3">
        Account &amp; data
      </p>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-balance">
        Delete your account
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        You can permanently delete your Utiligo account and data at any time,
        either from within the app or by requesting it here.
      </p>

      <section className="mt-12">
        <h2 className="font-display font-bold text-2xl tracking-tight">
          Option 1 &mdash; Delete it yourself in the app
        </h2>
        <p className="mt-2 text-muted">
          This is instant and doesn&rsquo;t require waiting on us.
        </p>
        <ol className="mt-6 space-y-4">
          <Step n={1}>Open the Utiligo app and log in.</Step>
          <Step n={2}>
            Tap the menu icon on the home screen, then go to{" "}
            <strong className="text-ink">Settings</strong>.
          </Step>
          <Step n={3}>
            Tap <strong className="text-ink">Delete Account</strong> and
            confirm.
          </Step>
        </ol>
      </section>

      <section className="mt-14 rounded-xl border border-border bg-surface p-7">
        <h2 className="font-display font-bold text-2xl tracking-tight">
          Option 2 &mdash; Request deletion by email
        </h2>
        <p className="mt-2 text-muted">
          If you&rsquo;ve already uninstalled the app or can&rsquo;t log in,
          email us from the address on your account and we&rsquo;ll delete it
          for you.
        </p>
        <a
          href="mailto:jayanton.roblico@gmail.com?subject=Delete%20my%20Utiligo%20account"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-strong transition-colors"
        >
          jayanton.roblico@gmail.com
        </a>
        <p className="mt-4 text-sm text-muted">
          We&rsquo;ll process email requests within 30 days. To help us find
          your account quickly, include the email or mobile number you
          registered with.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display font-bold text-2xl tracking-tight">
          What gets deleted
        </h2>
        <ul className="mt-4 space-y-3 text-muted list-disc pl-5 marker:text-accent">
          <li>Your profile: name, email, mobile number, and delivery address</li>
          <li>Your push notification token</li>
          <li>
            If you&rsquo;re a station owner: your station, its product
            listings, and its order history
          </li>
          <li>Your sign-in credentials, removed from Firebase entirely</li>
        </ul>
        <p className="mt-4 text-muted">
          Completed order records tied to a station&rsquo;s accounting
          history may be retained in de-identified form (no longer linked to
          you) after your account is deleted. See our{" "}
          <a href="/privacy" className="text-accent hover:text-accent-strong">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
      </section>
    </div>
  );
}
