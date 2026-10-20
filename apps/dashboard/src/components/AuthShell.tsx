import { Logo } from "@journeyhome/ui/components/logo";

export function AuthShell({
  title,
  accent,
  subtitle,
  children,
}: {
  title: string;
  accent: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FBF9F4] px-6 pb-20 pt-9">
      <div className="mb-16 flex w-full max-w-[1200px] items-center justify-between">
        <a href={import.meta.env.VITE_MARKETING_URL ?? "/"}>
          <Logo />
        </a>
        <a href={import.meta.env.VITE_MARKETING_URL ?? "/"} className="text-[13px] font-semibold text-status-paused">
          Back to site
        </a>
      </div>
      <div className="flex w-full max-w-[440px] flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight">
            {title} <span className="font-serif font-normal italic text-link">{accent}</span>
          </h1>
          <p className="text-sm leading-relaxed text-status-paused">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
