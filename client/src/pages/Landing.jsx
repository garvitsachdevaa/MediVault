import { Link } from 'react-router-dom';
import { FileText, BellRing, Share2 } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Footer } from '../components/layout/Footer.jsx';

const features = [
  {
    Icon: FileText,
    title: 'Read your documents',
    body: 'Prescriptions and lab reports are turned into structured data that you review and confirm.',
  },
  {
    Icon: BellRing,
    title: 'Medicines & reminders',
    body: 'Confirmed prescriptions become medicine courses with dose reminders for the whole family.',
  },
  {
    Icon: Share2,
    title: 'Share with doctors',
    body: 'Create an expiring, read-only summary link for a doctor — no account needed on their side.',
  },
];

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold text-accent">MediVault</span>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/register">
            <Button>Register</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
            A patient-owned MyChart, built from your paper records
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Upload prescriptions and lab reports. MediVault reads them, you confirm, and your health
            data becomes organised medicines, reminders, lab trends, a timeline, and doctor share
            links.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/register">
              <Button>Get started</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline">I have an account</Button>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid max-w-4xl gap-4 px-6 pb-20 md:grid-cols-3">
          {features.map(({ Icon, title, body }) => (
            <Card key={title}>
              <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </Card>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
