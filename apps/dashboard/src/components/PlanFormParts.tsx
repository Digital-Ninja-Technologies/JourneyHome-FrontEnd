import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Select } from "@journeyhome/ui/components/select";
import { cn } from "@journeyhome/ui/lib/utils";
import { formatMoney } from "../lib/format";
import { usePackages } from "../lib/queries";

const RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Uncle / Aunt", "Other"];

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

/** "Who is this plan for?" fields. Read them back with `planRequestBody`. */
export function CoveredPersonFields() {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 text-base font-bold">Who is this plan for?</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName">
          <Input id="fullName" name="fullName" required minLength={2} placeholder="e.g. Adunni Okafor" />
        </Field>
        <Field label="Relationship" htmlFor="relationship">
          <Select id="relationship" name="relationship" defaultValue="Mother">
            {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Date of birth" htmlFor="dob">
          <Input id="dob" name="dob" type="date" required max={new Date().toISOString().slice(0, 10)} />
        </Field>
        <Field label="Gender" htmlFor="gender">
          <Select id="gender" name="gender" defaultValue="Female">
            <option>Female</option>
            <option>Male</option>
          </Select>
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" placeholder="e.g. 0803 123 4567" />
        </Field>
        <Field label="State / location" htmlFor="location">
          <Input id="location" name="location" placeholder="e.g. Lagos" />
        </Field>
        <Field label="Home address" htmlFor="address" className="sm:col-span-2">
          <Input id="address" name="address" required minLength={5} placeholder="e.g. 14 Awolowo Road, Ikoyi" />
        </Field>
      </div>
    </fieldset>
  );
}

export function PackagePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const packagesQ = usePackages();
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-base font-bold">Choose a package</legend>
      {packagesQ.isPending && <p className="text-sm text-muted">Loading packages…</p>}
      {packagesQ.isError && <p className="text-sm text-status-cancelled">Couldn&rsquo;t load packages. {packagesQ.error.message}</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        {packagesQ.data?.map((p) => (
          <label
            key={p._id}
            className={cn(
              "flex cursor-pointer flex-col gap-2 rounded-2xl border p-4",
              value === p._id ? "border-foreground bg-cream/50 ring-1 ring-foreground" : "border-border bg-white",
            )}
          >
            <div className="flex items-center justify-between text-sm font-bold">
              {p.name}
              <input type="radio" name="package" value={p._id} required checked={value === p._id} onChange={() => onChange(p._id)} />
            </div>
            <div className="text-xl font-bold tracking-tight">
              {formatMoney(p.monthlyContributionMinor, p.currency)}
              <span className="text-xs font-normal text-muted">/mo</span>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Builds the `POST /plans` body from a form that contains `CoveredPersonFields`. */
export function planRequestBody(form: HTMLFormElement, packageId: string) {
  const d = new FormData(form);
  const text = (k: string) => String(d.get(k) ?? "").trim();
  const location = text("location");
  return {
    packageId,
    coveredPerson: {
      fullName: text("fullName"),
      relationship: text("relationship").toLowerCase(),
      dateOfBirth: new Date(`${text("dob")}T00:00:00.000Z`).toISOString(),
      gender: text("gender").toLowerCase(),
      ...(text("phone") && { phoneNumber: text("phone") }),
      // The backend stores a single address string, so state/location is folded into it.
      address: location ? `${text("address")}, ${location}` : text("address"),
    },
  };
}
