import { getServices, metaForService } from "@/lib/services";
import { FlameIcon, ShirtIcon, StorefrontIcon, TrashIcon, WaterDropIcon } from "@/components/icons";

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
    body: "Water, gas, laundry pickup, or garbage collection — browse stations near your address.",
  },
  {
    n: "02",
    title: "A station accepts",
    body: "The nearest verified station confirms your order and gets it ready.",
  },
  {
    n: "03",
    title: "It arrives by motorcycle",
    body: "Track the status as your order is delivered straight to your door.",
  },
];

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

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-28 sm:pt-28 sm:pb-36">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 mb-5">
            Local delivery &middot; Philippines
          </p>
          <h1 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-5xl sm:text-6xl md:text-7xl text-balance max-w-3xl">
            Everyday errands,
            <br />
            delivered by motorcycle
          </h1>
          <p className="mt-7 max-w-lg text-lg text-white/85">
            Utiligo connects you with water refill, gas, laundry, and garbage
            collection stations in your neighborhood — order in a few taps,
            track it in real time.
          </p>
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
    </>
  );
}

const FALLBACK_SERVICES = [
  { id: 1, title: "Mineral Water", description: null },
  { id: 2, title: "Gas for Stoves", description: null },
  { id: 3, title: "Laundry Pickup", description: null },
  { id: 4, title: "Garbage Collection", description: null },
];
