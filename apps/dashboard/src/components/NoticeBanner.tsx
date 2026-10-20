import { AlertCircle, Info } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { MARKETING_URL, type Notice } from "../lib/plans";

const TONE = {
  due: "bg-cream text-status-due",
  review: "bg-status-review-bg text-status-review",
  neutral: "bg-sand text-ink-soft",
};

export function NoticeBanner({ notice, className }: { notice: Notice; className?: string }) {
  const Icon = notice.tone === "due" ? AlertCircle : Info;
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed", TONE[notice.tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        {notice.text}{" "}
        {notice.policy && (
          <a href={`${MARKETING_URL}/terms`} className="underline">
            Read the policy
          </a>
        )}
      </div>
    </div>
  );
}
