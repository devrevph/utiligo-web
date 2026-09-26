import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Utiligo",
  description:
    "How Utiligo collects, uses, and shares information in the water refill, gas, laundry, and garbage collection delivery app.",
};

const TOC = [
  { href: "#collect", label: "Information we collect" },
  { href: "#use", label: "How we use it" },
  { href: "#share", label: "How we share it" },
  { href: "#retention", label: "Data retention" },
  { href: "#rights", label: "Your choices" },
  { href: "#children", label: "Children's privacy" },
  { href: "#security", label: "Security" },
  { href: "#changes", label: "Changes to this policy" },
  { href: "#contact", label: "Contact us" },
];

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-accent-tint px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top border-t border-border">{children}</td>;
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-3">
        Effective July 24, 2026
      </p>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-balance">
        Privacy Policy
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Utiligo connects you with nearby water refill, gas, laundry pickup, and
        garbage collection businesses for motorcycle delivery. This page
        explains what information we collect to make that work, how we use
        it, and the choices you have.
      </p>

      <nav
        aria-label="Table of contents"
        className="mt-10 rounded-xl border border-border bg-surface p-5"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted mb-3">
          On this page
        </p>
        <ol className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {TOC.map((item, i) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex gap-2 text-sm text-ink hover:text-accent transition-colors"
              >
                <span className="text-accent font-semibold w-4 shrink-0">
                  {i + 1}.
                </span>
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-14 space-y-14 text-[16px] leading-relaxed">
        <section id="collect" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">1.</span>
            Information we collect
          </h2>
          <p className="mt-4 text-muted">
            We collect the information below directly from you, and some
            information automatically as you use the app.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>What it includes</Th>
                  <Th>When it&rsquo;s collected</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>Account information</Td>
                  <Td>
                    Email address and password (managed by Firebase
                    Authentication), first and last name, mobile number
                  </Td>
                  <Td>When you sign up</Td>
                </tr>
                <tr>
                  <Td>Delivery address &amp; location</Td>
                  <Td>
                    Street address, city, postal code, and precise
                    coordinates (latitude/longitude) for your delivery
                    location
                  </Td>
                  <Td>
                    When you sign up or update your address, or place an
                    order with a different delivery location
                  </Td>
                </tr>
                <tr>
                  <Td>Order information</Td>
                  <Td>
                    Service and merchant ordered from, order type, quantity,
                    delivery notes, payment status and method
                  </Td>
                  <Td>When you place, receive, or pay for an order</Td>
                </tr>
                <tr>
                  <Td>Push notification token</Td>
                  <Td>
                    A device identifier issued by Expo&rsquo;s push service,
                    used to deliver order-status notifications
                  </Td>
                  <Td>When you grant notification permission</Td>
                </tr>
                <tr>
                  <Td>Business information</Td>
                  <Td>
                    Business name, contact numbers, business address, and
                    services offered
                  </Td>
                  <Td>Only if you register as a merchant owner</Td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-muted">
            We do not access your device&rsquo;s contacts, photos, or files
            except when you deliberately choose an image (for example, a
            container photo) to attach to an order.
          </p>
        </section>

        <section id="use" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">2.</span>
            How we use it
          </h2>
          <ul className="mt-4 space-y-3 text-muted list-disc pl-5 marker:text-accent">
            <li>
              <strong className="text-ink">To operate your account</strong> —
              authenticate you, and show your profile and order history.
            </li>
            <li>
              <strong className="text-ink">To connect you with nearby merchants</strong>{" "}
              — your delivery coordinates are compared against each
              merchant&rsquo;s address to show distance and an estimated
              motorcycle delivery time, and to let you filter listings by
              distance.
            </li>
            <li>
              <strong className="text-ink">To fulfill orders</strong> — your
              delivery address and order details are shared with the
              specific merchant you order from, so they can accept, prepare,
              and deliver it.
            </li>
            <li>
              <strong className="text-ink">To notify you</strong> — order
              acceptance, rejection, delivery, and payment updates are sent
              as push notifications.
            </li>
            <li>
              <strong className="text-ink">To improve reliability</strong> —
              basic request logs (never passwords or full payment details)
              help us diagnose bugs and outages.
            </li>
          </ul>
        </section>

        <section id="share" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">3.</span>
            How we share it
          </h2>
          <p className="mt-4 text-muted">
            We do not sell your information. We share it only as follows:
          </p>
          <ul className="mt-4 space-y-3 text-muted list-disc pl-5 marker:text-accent">
            <li>
              <strong className="text-ink">With the merchant you order from</strong>{" "}
              — your name, mobile number, and delivery address are visible
              to that merchant&rsquo;s owner so they can complete your order.
              Merchant owners cannot see your information unless you place
              an order with them.
            </li>
            <li>With service providers we rely on to run the app:</li>
          </ul>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr>
                  <Th>Provider</Th>
                  <Th>Purpose</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td>Firebase (Google)</Td>
                  <Td>Account authentication and sign-in</Td>
                </tr>
                <tr>
                  <Td>Google Maps Platform</Td>
                  <Td>Address autocomplete, geocoding, and map display</Td>
                </tr>
                <tr>
                  <Td>Expo</Td>
                  <Td>Delivering push notifications to your device</Td>
                </tr>
                <tr>
                  <Td>Supabase</Td>
                  <Td>Hosting our application database</Td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-border border-l-[3px] border-l-accent bg-accent-tint px-5 py-4 text-[15px]">
            We may also disclose information if required by law, or to
            protect the rights, safety, or property of Utiligo, our users, or
            the public.
          </div>
        </section>

        <section id="retention" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">4.</span>
            Data retention
          </h2>
          <p className="mt-4 text-muted">
            We keep your account and order information for as long as your
            account is active, so you can view your order history and
            re-order easily. If you delete your account, your profile,
            address, push token, and (if applicable) your merchant and its
            listings are permanently removed from our database, and your
            sign-in credentials are deleted from Firebase. Completed order
            records tied to a merchant&rsquo;s history may be retained in
            de-identified form for accounting purposes.
          </p>
        </section>

        <section id="rights" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">5.</span>
            Your choices
          </h2>
          <ul className="mt-4 space-y-3 text-muted list-disc pl-5 marker:text-accent">
            <li>
              <strong className="text-ink">Update your information</strong> —
              edit your name, mobile number, and address anytime from the
              Profile screen.
            </li>
            <li>
              <strong className="text-ink">Delete your account</strong> —
              available from Settings. This is permanent and cannot be
              undone.
            </li>
            <li>
              <strong className="text-ink">Location access</strong> — you can
              decline or revoke location permission in your device settings;
              you can still use the app by entering an address manually,
              though distance and delivery-time estimates won&rsquo;t be
              available.
            </li>
            <li>
              <strong className="text-ink">Notifications</strong> — you can
              disable push notifications anytime in your device settings.
            </li>
          </ul>
        </section>

        <section id="children" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">6.</span>
            Children&rsquo;s privacy
          </h2>
          <p className="mt-4 text-muted">
            Utiligo is not directed at children under 13, and we do not
            knowingly collect information from them. If you believe a child
            has provided us with personal information, contact us and we
            will remove it.
          </p>
        </section>

        <section id="security" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">7.</span>
            Security
          </h2>
          <p className="mt-4 text-muted">
            Passwords are handled entirely by Firebase Authentication using
            industry-standard hashing — Utiligo never sees or stores your
            password. Data is transmitted between the app and our servers
            over encrypted (HTTPS) connections, and database access is
            restricted to our application infrastructure.
          </p>
        </section>

        <section id="changes" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">8.</span>
            Changes to this policy
          </h2>
          <p className="mt-4 text-muted">
            If we make material changes to this policy, we&rsquo;ll update the
            effective date above and, where appropriate, notify you in the
            app.
          </p>
        </section>

        <section id="contact" className="scroll-mt-16">
          <h2 className="font-display font-bold text-2xl tracking-tight flex items-baseline gap-2.5">
            <span className="font-mono text-base font-medium text-accent">9.</span>
            Contact us
          </h2>
          <p className="mt-4 text-muted">
            Questions about this policy or your data can be sent to{" "}
            <a
              href="mailto:jayanton.roblico@gmail.com"
              className="text-accent hover:text-accent-strong"
            >
              jayanton.roblico@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
