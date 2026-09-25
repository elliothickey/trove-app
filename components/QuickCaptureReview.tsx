"use client";

import { useState, useTransition, type ReactNode } from "react";
import { unstable_rethrow } from "next/navigation";
import type {
  ExtractedContact,
  ExtractedEducation,
  ExtractedEmployment,
  ExtractedLocation,
} from "@/lib/ai/types";
import type { Contact, ContactLocationKind } from "@/lib/types";
import {
  findExistingContactMatchesAction,
  saveQuickCaptureContactAction,
} from "@/app/quick-capture/actions";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PlusIcon } from "@/components/ui/icons";
import { controlHeight, controlStyles } from "@/components/ui/Input";

const LOCATION_KIND_OPTIONS: { value: ContactLocationKind | ""; label: string }[] = [
  { value: "", label: "Unspecified" },
  { value: "hometown", label: "Hometown" },
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

const labelStyles = "mb-1.5 block text-xs font-medium text-ink-muted";

// Groups one kind of extracted detail under a heading, with an optional
// action (e.g. "Add employment") on the right.
function ReviewSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="-mr-2 -mt-1.5">
      <PlusIcon className="size-3.5" />
      {children}
    </Button>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-ink-subtle">{children}</p>;
}

// Extracted dates may be exact ("2024-06-01"), coarse ("2024" or "Summer
// 2024"), or absent -- never invented. A native <input type="date"> would
// silently blank out anything that isn't a real YYYY-MM-DD value, which
// would look like data loss to the user. So date fields in this draft
// editor stay plain text, preserving whatever the AI (or the user) wrote
// until a later "save to CRM" step has to reconcile them against the
// database's exact `date` columns.
function DateField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className={labelStyles}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g. 2024 or 2024-06"
        className={`${controlStyles} ${controlHeight}`}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  inputClassName = controlHeight,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
}) {
  return (
    <div>
      <label className={labelStyles}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${controlStyles} ${inputClassName}`}
      />
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm text-xs font-medium text-ink-subtle transition-colors hover:text-danger"
    >
      Remove
    </button>
  );
}

function EmploymentRow({
  item,
  onChange,
  onRemove,
}: {
  item: ExtractedEmployment;
  onChange: (patch: Partial<ExtractedEmployment>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Company" value={item.company} onChange={(v) => onChange({ company: v })} />
        <TextField label="Role" value={item.role ?? ""} onChange={(v) => onChange({ role: v })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Start date" value={item.startDate ?? ""} onChange={(v) => onChange({ startDate: v })} />
        <DateField
          label="End date"
          value={item.endDate ?? ""}
          onChange={(v) => onChange({ endDate: v })}
          disabled={item.isCurrent}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={item.isCurrent ?? false}
            onChange={(e) =>
              onChange({
                isCurrent: e.target.checked,
                endDate: e.target.checked ? "" : item.endDate,
              })
            }
            className="size-4 accent-ink"
          />
          Current job
        </label>
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  );
}

function EducationRow({
  item,
  onChange,
  onRemove,
}: {
  item: ExtractedEducation;
  onChange: (patch: Partial<ExtractedEducation>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <TextField label="School" value={item.school} onChange={(v) => onChange({ school: v })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField label="Degree" value={item.degree ?? ""} onChange={(v) => onChange({ degree: v })} />
        <TextField
          label="Field of study"
          value={item.fieldOfStudy ?? ""}
          onChange={(v) => onChange({ fieldOfStudy: v })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DateField label="Start date" value={item.startDate ?? ""} onChange={(v) => onChange({ startDate: v })} />
        <DateField label="End date" value={item.endDate ?? ""} onChange={(v) => onChange({ endDate: v })} />
      </div>
      <div className="flex justify-end">
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  );
}

function LocationRow({
  item,
  onChange,
  onRemove,
}: {
  item: ExtractedLocation;
  onChange: (patch: Partial<ExtractedLocation>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 py-4 first:pt-0 last:pb-0">
      <TextField label="Location" value={item.location} onChange={(v) => onChange({ location: v })} />
      <div>
        <label className={labelStyles}>Type</label>
        <select
          value={item.kind ?? ""}
          onChange={(e) =>
            onChange({ kind: (e.target.value || undefined) as ContactLocationKind | undefined })
          }
          className={`${controlStyles} ${controlHeight}`}
        >
          {LOCATION_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  );
}

export default function QuickCaptureReview({
  extracted,
  rawNote,
}: {
  extracted: ExtractedContact;
  rawNote: string;
}) {
  const [name, setName] = useState(extracted.name ?? "");
  const [employment, setEmployment] = useState<ExtractedEmployment[]>(extracted.employment);
  const [education, setEducation] = useState<ExtractedEducation[]>(extracted.education);
  const [locations, setLocations] = useState<ExtractedLocation[]>(extracted.locations);
  const [interactionSummary, setInteractionSummary] = useState(extracted.interactionSummary ?? "");
  const [notes, setNotes] = useState(extracted.notes ?? "");
  const [isSaving, startSave] = useTransition();
  const [saveError, setSaveError] = useState<string | undefined>();

  // Duplicate-name confirmation, run once at Save time against the final
  // edited name -- never while the user is still typing. `matches` is only
  // ever populated for the exact name that was just checked (`checkedName`);
  // if the user edits the name afterward, the next Save click re-checks
  // instead of confirming a stale selection.
  const [matches, setMatches] = useState<Contact[]>([]);
  const [checkedName, setCheckedName] = useState<string | undefined>();
  // "new" (the safe default) or the id of an existing contact the user
  // explicitly picked. Never defaulted to an existing contact.
  const [selectedContactId, setSelectedContactId] = useState<string>("new");

  const trimmedName = name.trim();
  const awaitingConfirmation = matches.length > 0 && trimmedName === checkedName;

  async function doSave(existingContactId?: string) {
    let result;
    try {
      result = await saveQuickCaptureContactAction({
        rawNote,
        name: trimmedName,
        employment,
        education,
        locations,
        interactionSummary,
        notes,
        existingContactId,
      });
    } catch (err) {
      // redirect() on a successful save throws a framework control-flow
      // error -- let it propagate. Anything else (e.g. a dropped network
      // connection) becomes an inline error so the draft stays on screen
      // instead of the error page replacing it.
      unstable_rethrow(err);
      console.error(err);
      setSaveError("Couldn't reach the server. Check your connection and try again.");
      return;
    }
    // On success this never resolves here -- the action redirects instead.
    if (result.status === "error") {
      setSaveError(result.error);
    }
  }

  // The draft (name/employment/education/locations/etc. state above) is
  // never cleared here -- on error it stays exactly as the user left it so
  // they can fix the problem and retry without re-entering anything.
  function handleSave() {
    if (isSaving) return;
    setSaveError(undefined);
    startSave(async () => {
      if (awaitingConfirmation) {
        await doSave(selectedContactId === "new" ? undefined : selectedContactId);
        return;
      }

      let found: Contact[];
      try {
        found = await findExistingContactMatchesAction(trimmedName);
      } catch (err) {
        console.error(err);
        setSaveError(
          "Couldn't check for existing contacts. Please try again — if your session has expired, sign in again in a new tab first."
        );
        return;
      }
      setCheckedName(trimmedName);
      if (found.length === 0) {
        setMatches([]);
        await doSave(undefined);
        return;
      }
      // Found possible matches -- pause and let the user choose. Nothing is
      // saved yet, and no match is pre-selected.
      setMatches(found);
      setSelectedContactId("new");
    });
  }

  function updateAt<T>(setList: (updater: (prev: T[]) => T[]) => void, index: number, patch: Partial<T>) {
    setList((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function removeAt<T>(setList: (updater: (prev: T[]) => T[]) => void, index: number) {
    setList((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-[-0.01em] text-ink">
          Here&apos;s what Trove understood
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Adjust anything that&apos;s off. Nothing is saved until you confirm.
        </p>
      </div>

      <ReviewSection title="Person">
        <div className="flex items-start gap-4">
          <Avatar name={name || "?"} className="mt-6 size-11 text-sm" />
          <div className="min-w-0 flex-1 space-y-4">
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Full name"
              inputClassName="h-10 text-base font-medium sm:text-[15px]"
            />
            <div>
              <label className={labelStyles}>Other notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`${controlStyles} leading-relaxed`}
              />
            </div>
          </div>
        </div>
      </ReviewSection>

      <ReviewSection
        title="Employment"
        action={
          <AddButton onClick={() => setEmployment((prev) => [...prev, { company: "" }])}>
            Add employment
          </AddButton>
        }
      >
        {employment.length === 0 ? (
          <EmptyNote>No employment records.</EmptyNote>
        ) : (
          <div className="divide-y divide-line">
            {employment.map((item, index) => (
              <EmploymentRow
                key={index}
                item={item}
                onChange={(patch) => updateAt(setEmployment, index, patch)}
                onRemove={() => removeAt(setEmployment, index)}
              />
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection
        title="Education"
        action={
          <AddButton onClick={() => setEducation((prev) => [...prev, { school: "" }])}>
            Add education
          </AddButton>
        }
      >
        {education.length === 0 ? (
          <EmptyNote>No education records.</EmptyNote>
        ) : (
          <div className="divide-y divide-line">
            {education.map((item, index) => (
              <EducationRow
                key={index}
                item={item}
                onChange={(patch) => updateAt(setEducation, index, patch)}
                onRemove={() => removeAt(setEducation, index)}
              />
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection
        title="Locations"
        action={
          <AddButton onClick={() => setLocations((prev) => [...prev, { location: "" }])}>
            Add location
          </AddButton>
        }
      >
        {locations.length === 0 ? (
          <EmptyNote>No locations.</EmptyNote>
        ) : (
          <div className="divide-y divide-line">
            {locations.map((item, index) => (
              <LocationRow
                key={index}
                item={item}
                onChange={(patch) => updateAt(setLocations, index, patch)}
                onRemove={() => removeAt(setLocations, index)}
              />
            ))}
          </div>
        )}
      </ReviewSection>

      <ReviewSection
        title="Interaction"
        description="Saved to their timeline, along with your original note."
      >
        <label className={labelStyles}>How you met / context</label>
        <textarea
          value={interactionSummary}
          onChange={(e) => setInteractionSummary(e.target.value)}
          rows={2}
          className={`${controlStyles} leading-relaxed`}
        />
      </ReviewSection>

      <ReviewSection title="Original note" description="Kept exactly as you wrote it.">
        <p className="whitespace-pre-wrap rounded-control bg-sunken px-4 py-3 text-sm leading-relaxed text-ink-muted">
          {rawNote}
        </p>
      </ReviewSection>

      {awaitingConfirmation && (
        <div className="space-y-3 rounded-card border border-[#e6d7b3] bg-[#fbf6e9] p-5">
          <p className="text-sm font-medium text-ink">
            You already have {matches.length === 1 ? "someone" : "people"} named &quot;
            {checkedName}&quot; in Trove. Is this the same person?
          </p>
          <div className="space-y-2">
            {matches.map((match) => (
              <label
                key={match.id}
                className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink-muted transition-colors hover:border-line-strong has-checked:border-ink-subtle"
              >
                <input
                  type="radio"
                  name="existingContactMatch"
                  className="mt-0.5 accent-ink"
                  checked={selectedContactId === match.id}
                  onChange={() => setSelectedContactId(match.id)}
                />
                <span>
                  <span className="font-medium text-ink">{match.name}</span>
                  {[match.employer, match.school, match.location].filter(Boolean).length > 0 && (
                    <span className="text-ink-muted">
                      {" "}
                      — {[match.employer, match.school, match.location].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-surface px-3 py-2.5 text-sm text-ink-muted transition-colors hover:border-line-strong has-checked:border-ink-subtle">
              <input
                type="radio"
                name="existingContactMatch"
                className="mt-0.5 accent-ink"
                checked={selectedContactId === "new"}
                onChange={() => setSelectedContactId("new")}
              />
              <span className="font-medium text-ink">
                This is a different person — add them as someone new
              </span>
            </label>
          </div>
          {notes.trim() && (
            <p className="text-xs text-ink-muted">
              If you pick someone already in Trove, your &quot;Other notes&quot; will be added
              to their existing notes.
            </p>
          )}
        </div>
      )}

      {saveError && <Alert tone="error">{saveError}</Alert>}

      <div className="flex items-center gap-3 pt-4">
        <Button
          onClick={handleSave}
          disabled={!trimmedName || isSaving}
          title={!trimmedName ? "Add a name before saving" : undefined}
        >
          {isSaving
            ? "Saving..."
            : awaitingConfirmation
              ? "Confirm & Save"
              : "Save to Trove"}
        </Button>
        {!trimmedName && <p className="text-xs text-ink-muted">Add a name before saving.</p>}
      </div>
    </div>
  );
}
