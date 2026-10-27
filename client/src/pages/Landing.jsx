import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  BellRing,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Upload,
  ClipboardCheck,
  LineChart,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { EASE_OUT } from '../lib/motion.js';
import { SiteHeader } from '../components/layout/SiteHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { HeroArt } from '../components/brand/HeroArt.jsx';

const features = [
  {
    Icon: FileText,
    title: 'Read your documents',
    body: 'Prescriptions and lab reports are turned into structured data that you review and confirm — line by line, in plain language.',
  },
  {
    Icon: BellRing,
    title: 'Medicines & reminders',
    body: 'Confirmed prescriptions become medicine courses with dose reminders, for yourself and everyone in your family.',
  },
  {
    Icon: Share2,
    title: 'Share with doctors',
    body: 'Create an expiring, read-only summary link for a doctor — no account or app needed on their side.',
  },
];

const steps = [
  {
    Icon: Upload,
    title: 'Upload',
    body: 'Add a photo or PDF of a prescription or lab report.',
  },
  {
    Icon: ClipboardCheck,
    title: 'Confirm',
    body: 'MediVault reads it; you check and confirm every detail.',
  },
  {
    Icon: LineChart,
    title: 'Track',
    body: 'Watch medicines, reminders and lab trends come together.',
  },
];

const trust = [
  { Icon: Lock, label: 'Private by design' },
  { Icon: CheckCircle2, label: 'You confirm everything' },
  { Icon: ShieldCheck, label: 'Not medical advice' },
];

// Hero: staggered headline → subcopy → CTAs → trust strip.
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

// Cards that reveal as they scroll into view.
const inViewCard = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};
const inViewGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute inset-0 bg-brand-mesh" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] animate-aurora-drift rounded-full bg-accent-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-40 h-96 w-96 animate-aurora-drift rounded-full bg-accent-100/50 blur-3xl [animation-delay:-6s]" />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-2 lg:gap-8 lg:pb-28 lg:pt-24">
            <motion.div variants={heroStagger} initial="hidden" animate="show">
              <motion.span
                variants={heroItem}
                className="inline-flex items-center gap-2 rounded-full border border-accent-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-accent-700 shadow-xs backdrop-blur"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-500" />
                </span>
                Patient-owned health records
              </motion.span>
              <motion.h1
                variants={heroItem}
                className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-900 sm:text-[3.4rem]"
              >
                Your health records,{' '}
                <span className="bg-gradient-to-br from-accent-600 to-accent-800 bg-clip-text text-transparent">
                  finally in one calm place.
                </span>
              </motion.h1>
              <motion.p
                variants={heroItem}
                className="mt-5 max-w-xl text-lg leading-relaxed text-ink-600"
              >
                Upload prescriptions and lab reports. MediVault reads them, you confirm, and your
                paper history becomes organised medicines, reminders, lab trends, a clear timeline,
                and secure doctor share links.
              </motion.p>
              <motion.div variants={heroItem} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    I have an account
                  </Button>
                </Link>
              </motion.div>

              {/* Trust strip */}
              <motion.ul
                variants={heroItem}
                className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5"
              >
                {trust.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 text-sm font-medium text-ink-600"
                  >
                    <Icon className="h-4 w-4 text-accent-600" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </motion.ul>
            </motion.div>

            <motion.div
              className="lg:pl-6"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
            >
              <HeroArt />
            </motion.div>
          </div>
        </section>

        {/* Credibility strip */}
        <section className="border-t border-ink-200/70 bg-white/70">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 divide-x divide-ink-100 px-6 py-8 sm:grid-cols-4">
            {[
              { k: 'Line by line', v: 'You confirm' },
              { k: 'Read-only', v: 'Doctor links' },
              { k: 'Whole family', v: 'One account' },
              { k: 'Private', v: 'By design' },
            ].map((s, i) => (
              <div key={s.v} className={i === 0 ? 'pr-4 sm:pr-6' : 'px-4 sm:px-6'}>
                <p className="font-display text-xl font-bold text-ink-900">{s.v}</p>
                <p className="mt-0.5 text-sm text-ink-500">{s.k}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-ink-200/70 bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900">
                Everything from a stack of paper, organised for you
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-600">
                MediVault does the reading. You stay in control of every record that goes in.
              </p>
            </div>

            <motion.div
              className="mt-12 grid gap-6 md:grid-cols-3"
              variants={inViewGroup}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {features.map(({ Icon, title, body }) => (
                <motion.article
                  key={title}
                  variants={inViewCard}
                  className="group rounded-2xl border border-ink-200/80 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-700 ring-1 ring-accent-100 transition group-hover:bg-accent-100">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{body}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-ink-200/70 bg-ink-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900">
                Three steps. You stay in charge.
              </h2>
              <p className="mt-3 text-lg leading-relaxed text-ink-600">
                Nothing is ever saved to your record until you have reviewed and confirmed it.
              </p>
            </div>

            <motion.ol
              className="mt-12 grid gap-6 md:grid-cols-3"
              variants={inViewGroup}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              {steps.map(({ Icon, title, body }, i) => (
                <motion.li
                  key={title}
                  variants={inViewCard}
                  className="group relative overflow-hidden rounded-2xl border border-ink-200/80 bg-white p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -top-4 font-display text-7xl font-extrabold text-ink-100/90"
                  >
                    {i + 1}
                  </span>
                  <div className="relative flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-grad text-white shadow-sm ring-1 ring-inset ring-white/20">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="tabular text-sm font-semibold uppercase tracking-wide text-accent-600">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="relative mt-4 text-lg font-semibold text-ink-900">{title}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-ink-600">{body}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-white">
          <div className="mx-auto w-full max-w-6xl px-6 py-20">
            <div className="relative overflow-hidden rounded-3xl bg-accent-800 px-8 py-14 text-center shadow-float sm:px-14">
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.12]" />
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent-500/40 blur-3xl" />
              <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-400/30 blur-3xl" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Start your family&apos;s health record today
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-accent-100">
                  Free to begin. Your data stays yours, and you confirm everything that goes in.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/register">
                    <Button variant="white" size="lg" className="w-full sm:w-auto">
                      Create your account
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="inverse" size="lg" className="w-full sm:w-auto">
                      Log in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
