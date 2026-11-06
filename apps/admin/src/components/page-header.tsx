import { Link, type LinkProps } from "@tanstack/react-router";

export interface Crumb {
  label: string;
  to?: LinkProps["to"];
  params?: LinkProps["params"];
}

export function PageHeader({
  crumbs,
  title,
  accent,
  description,
  badge,
  actions,
}: {
  crumbs?: Crumb[];
  title: string;
  /** Italic serif word appended to the title. */
  accent?: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-1 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
          >
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1">
                {i > 0 && <span aria-hidden>/</span>}
                {c.to ? (
                  <Link to={c.to} params={c.params} className="hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">
            {title} {accent && <span className="italic">{accent}</span>}
          </h1>
          {badge}
        </div>
        {description && <p className="page-description mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
