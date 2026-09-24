import Image from "next/image";
import Link from "next/link";
import { getServices, metaForService } from "@/lib/services";
import {
  AppleIcon,
  CheckIcon,
  FlameIcon,
  PlayIcon,
  ShirtIcon,
  StorefrontIcon,
  TrashIcon,
  WaterDropIcon,
} from "@/components/icons";
import heroAccount from "../../../public/img/photo_2026-07-28_19-45-12.jpg";
import heroAnalytics from "../../../public/img/photo_2026-07-28_19-45-14.jpg";
import heroDashboard from "../../../public/img/photo_2026-07-28_19-45-16.jpg";

const ICONS = {
  water: WaterDropIcon,
  flame: FlameIcon,
  shirt: ShirtIcon,
  trash: TrashIcon,
  store: StorefrontIcon,
};

const STEPS = [
  {
    n: "01",
    title: "Pick a service",
    body: "Water, gas, laundry pickup, or garbage collection — browse merchants near your address.",
  },
  {
    n: "02",
    title: "A merchant accepts",
    body: "The nearest verified merchant confirms your order and gets it ready.",
  },
  {
    n: "03",
    title: "It arrives by motorcycle",
    body: "Track the status as your order is delivered straight to your door.",
  },
];

const FEATURE_GROUPS = [
  {
    title: "For customers",
    body: "Everything you need to order and track everyday errands.",
    items: [
      "Order water refills, LPG gas, laundry pickup, or garbage collection",
      "Browse merchants near you, sorted and filtered by distance",
      "Choose door-to-door delivery or pickup at the merchant",
      "Pay with cash or GCash",
      "Photo upload for your container on refill orders",
      "Save your address, or pin a delivery spot on the map",
      "Real-time order tracking, from accepted to delivered",
      "Push notifications the moment your order status changes",
      "Full order history in one place",
    ],
  },
  {
    title: "For businesses",
    body: "Run your water, gas, laundry, or garbage merchant from the same app.",
    items: [
      "Flip on Business Mode from your own account — no separate app to install",
      "Register your merchant with location, contact info, and category",
      "Get verified with a simple document upload flow",
      "Orders and revenue dashboard with selectable date ranges",
      "Accept or reject incoming orders in one tap",
      "Manage your product catalog: prices, stock, photos, refillable items",
      "Set your own garbage-collection pricing, by bag, trip, kg, or flat rate",
      "Mark orders paid and record delivery-time pricing for refills",
    ],
  },
  {
    title: "For delivery",
    body: "No separate rider app — your merchant handles delivery too.",
    items: [
      "Every accepted order lands in one delivery queue",
      "Turn-by-turn directions to each stop",
      "Multi-stop route across all pending deliveries",
      "Mark orders delivered and record cash payment on the spot",
    ],
  },
];

function DownloadButtons({
  tone = "onLight",
  className = "",
}: {
  tone?: "onLight" | "onDark";
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span
        aria-disabled="true"
        title="Coming soon"
        className="inline-flex cursor-not-allowed select-none items-center gap-2.5 rounded-xl bg-black px-4 py-2.5 text-white opacity-90"
      >
        <AppleIcon className="h-6 w-6 shrink-0" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide text-white/70">
            Download on the
          </span>
          <span className="-mt-0.5 block text-[15px] font-semibold">App Store</span>
        </span>
      </span>
      <span
        aria-disabled="true"
        title="Coming soon"
        className="inline-flex cursor-not-allowed select-none items-center gap-2.5 rounded-xl bg-black px-4 py-2.5 text-white opacity-90"
      >
        <PlayIcon className="h-5.5 w-5.5 shrink-0" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] uppercase tracking-wide text-white/70">
            Get it on
          </span>
          <span className="-mt-0.5 block text-[15px] font-semibold">Google Play</span>
        </span>
      </span>
      <span
        className={`font-mono text-[11px] uppercase tracking-wide ${
          tone === "onDark" ? "text-white/60" : "text-muted"
        }`}
      >
        Coming soon
      </span>
    </div>
  );
}

export default async function Home() {
  const services = await getServices();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)] text-white">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-40"
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            id="route"
            d="M -20 160 C 200 160, 260 60, 460 90 S 760 190, 980 80 S 1180 40, 1240 60"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="2 14"
            strokeLinecap="round"
          />
          <circle r="5" fill="white" className="route-dot">
            <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
              <mpath href="#route" />
            </animateMotion>
          </circle>
        </svg>

        <div className="relative mx-auto grid max-w-5xl gap-14 px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-32">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 mb-5">
              Local delivery &middot; Philippines
            </p>
            <h1 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl text-balance max-w-3xl">
              Everyday errands,
              <br />
              delivered to your door
            </h1>
            <p className="mt-7 max-w-lg text-lg text-white/85">
              Utiligo connects you with water refill, gas, laundry, and garbage
              collection merchants in your neighborhood — order in a few taps,
              track it in real time.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-xl bg-white px-5 py-3 text-[15px] font-semibold text-[#1d4ed8] shadow-sm transition-colors hover:bg-white/90"
              >
                Open the web app
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-white/40 px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
            <DownloadButtons tone="onDark" className="mt-6" />
          </div>

          <div className="relative mx-auto w-full max-w-[17rem] sm:max-w-[19rem] lg:mx-0 lg:justify-self-end">
            <div className="absolute -left-10 top-2 w-[58%] -rotate-12 overflow-hidden rounded-[1.75rem] border-4 border-white/15 shadow-2xl">
              <Image
                src={heroDashboard}
                alt="Utiligo business dashboard showing a gas merchant's orders and revenue"
                className="h-auto w-full"
                sizes="(min-width: 1024px) 10rem, 8rem"
              />
            </div>
            <div className="absolute -right-8 top-12 w-[64%] rotate-6 overflow-hidden rounded-[1.75rem] border-4 border-white/25 shadow-2xl">
              <Image
                src={heroAnalytics}
                alt="Utiligo revenue and order analytics chart for a service merchant"
                className="h-auto w-full"
                sizes="(min-width: 1024px) 11rem, 9rem"
              />
            </div>
            <div className="relative w-[78%] -rotate-3 overflow-hidden rounded-[1.75rem] border-4 border-white/40 shadow-2xl">
              <Image
                src={heroAccount}
                alt="Utiligo app home screen showing account details and available services"
                className="h-auto w-full"
                sizes="(min-width: 1024px) 13rem, 11rem"
                preload
              />
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-5xl px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-xl mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-3">
            What you can order
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            Four everyday services, one app
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {(services.length > 0
            ? services
            : FALLBACK_SERVICES
          ).map((service) => {
            const meta = metaForService(service.title);
            const Icon = ICONS[meta.icon];
            return (
              <article
                key={service.id}
                className="rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-border-strong"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-tint text-accent">
                  <Icon className="h-5.5 w-5.5" />
                </span>
                <h3 className="mt-5 font-display font-bold text-xl tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {meta.tagline}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-3">
                One app, every role
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
                No separate merchant or rider app to install
              </h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
                Other delivery platforms make you juggle three different apps —
                one for customers, one for merchants, one for riders. Utiligo
                is a single app: order as a customer, flip on Business Mode to
                run your merchant, and handle delivery from the same account —
                no extra downloads, no extra logins.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold text-lg tracking-tight">
                  As a customer
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Order from nearby merchants and track delivery in real time.
                </p>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-display font-bold text-lg tracking-tight">
                  As a merchant owner
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Accept orders, manage your catalog, and see your dashboard.
                </p>
              </div>
              <div className="rounded-2xl border border-border p-6 sm:col-span-2">
                <h3 className="font-display font-bold text-lg tracking-tight">
                  Delivering an order
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  Build a multi-stop route and mark orders delivered — right
                  from your merchant&apos;s own account.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-xl mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-3">
            Full feature list
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            Everything in one app
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {FEATURE_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-border bg-surface p-7"
            >
              <h3 className="font-display font-bold text-xl tracking-tight">
                {group.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                {group.body}
              </p>
              <ul className="mt-6 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-xl mb-12">
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-3">
              How it works
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
              From order to doorstep
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="font-mono text-sm text-accent">{step.n}</span>
                <h3 className="mt-3 font-display font-bold text-lg tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 py-20 sm:py-24 scroll-mt-16">
        <div className="max-w-xl mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-3">
            Pricing
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            Free for everyone, for now
          </h2>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-10 max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-accent mb-2">
            All accounts
          </p>
          <p className="font-display font-extrabold text-5xl tracking-tight">
            Free
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            We&apos;re still early, so there&apos;s no pricing plan yet — ordering
            as a customer and running a merchant are both free.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "No fees to order",
              "No fees to register or run a merchant",
              "No commission on deliveries",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-gradient-to-br from-[var(--brand-a)] to-[var(--brand-b)] text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24 text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight text-balance">
            Get Utiligo
          </h2>
          <p className="mt-4 text-white/85">
            Launching soon on iOS and Android.
          </p>
          <DownloadButtons tone="onDark" className="mt-8 justify-center" />
        </div>
      </section>
    </>
  );
}

const FALLBACK_SERVICES = [
  { id: 1, title: "Mineral Water", description: null },
  { id: 2, title: "Gas for Stoves", description: null },
  { id: 3, title: "Laundry Pickup", description: null },
  { id: 4, title: "Garbage Collection", description: null },
];
