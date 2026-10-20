import { Link, useLocation } from "react-router-dom";

export default function ComingSoon({ title }: { title: string }) {
  const { pathname } = useLocation();
  return (
    <main className="flex min-h-screen flex-col items-start gap-3 p-10">
      <h1 className="font-serif text-4xl">{title}</h1>
      <p className="text-muted">This screen hasn&rsquo;t been built yet ({pathname}).</p>
      <Link to="/app" className="font-bold text-link underline">
        Back to dashboard
      </Link>
    </main>
  );
}
