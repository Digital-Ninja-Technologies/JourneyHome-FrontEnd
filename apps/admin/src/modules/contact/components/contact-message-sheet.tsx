import { buttonVariants } from "@journeyhome/ui/components/button";
import { ResponsiveDetailsView } from "@journeyhome/ui/components/responsive-details-view";
import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { formatPhoneDisplay } from "@journeyhome/ui/lib/phone";
import { cn } from "@journeyhome/ui/lib/utils";
import { Mail, Phone } from "lucide-react";
import { ComponentErrorState } from "@/components/async-boundary";
import { DetailItem } from "@/components/detail-item";
import { formatDateTime } from "@/lib/format";
import { useContactMessage } from "../query-options";

export function ContactMessageSheet({
  id,
  onOpenChange,
}: {
  id: string | undefined;
  onOpenChange: (open: boolean) => void;
}) {
  const messageQ = useContactMessage(id);
  const m = messageQ.data;

  return (
    <ResponsiveDetailsView
      open={Boolean(id)}
      onOpenChange={onOpenChange}
      title={m?.name ?? "Message"}
      description={
        m ? `${m.topic} · ${formatDateTime(m.createdAt)}` : undefined
      }
      footer={
        m && (
          <div className="flex w-full flex-wrap justify-end gap-2">
            <a
              href={`tel:${m.phone}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full px-4 text-xs",
              )}
            >
              <Phone className="size-3.5" />
              Call
            </a>
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-full px-4 text-xs",
              )}
            >
              <Mail className="size-3.5" />
              Reply by email
            </a>
          </div>
        )
      }
    >
      {messageQ.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : messageQ.isError ? (
        <ComponentErrorState
          error={messageQ.error}
          onRetry={() => void messageQ.refetch()}
        />
      ) : (
        m && (
          <div className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap rounded-2xl border border-border/60 bg-muted/40 p-5 text-sm leading-relaxed">
              {m.message}
            </p>
            <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 p-5">
              <DetailItem label="Email">{m.email}</DetailItem>
              <DetailItem label="Phone">
                {formatPhoneDisplay(m.phone)}
              </DetailItem>
            </dl>
          </div>
        )
      )}
    </ResponsiveDetailsView>
  );
}
