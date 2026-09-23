"use client";

import { useState, useTransition } from "react";
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

const LOCATION_KIND_OPTIONS: { value: ContactLocationKind | ""; label: string }[] = [
  { value: "", label: "Unspecified" },
  { value: "hometown", label: "Hometown" },
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

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
      <label className="block text-xs font-medium mb-1 text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g. 2024 or 2024-06"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-red-600 hover:text-red-800"
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
    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Company" value={item.company} onChange={(v) => onChange({ company: v })} />
        <TextField label="Role" value={item.role ?? ""} onChange={(v) => onChange({ role: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <DateField label="Start date" value={item.startDate ?? ""} onChange={(v) => onChange({ startDate: v })} />
        <DateField
          label="End date"
          value={item.endDate ?? ""}
          onChange={(v) => onChange({ endDate: v })}
          disabled={item.isCurrent}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={item.isCurrent ?? false}
            onChange={(e) =>
              onChange({
                isCurrent: e.target.checked,
                endDate: e.target.checked ? "" : item.endDate,
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400"
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
    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
      <TextField label="School" value={item.school} onChange={(v) => onChange({ school: v })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Degree" value={item.degree ?? ""} onChange={(v) => onChange({ degree: v })} />
        <TextField
          label="Field of study"
          value={item.fieldOfStudy ?? ""}
          onChange={(v) => onChange({ fieldOfStudy: v })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
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
    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
      <TextField label="Location" value={item.location} onChange={(v) => onChange({ location: v })} />
      <div>
        <label className="block text-xs font-medium mb-1 text-gray-500">Type</label>
        <select
          value={item.kind ?? ""}
          onChange={(e) =>
            onChange({ kind: (e.target.value || undefined) as ContactLocationKind | undefined })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-500">
          Review &amp; edit, then save to your contacts
        </h2>
      </div>

      <TextField label="Name" value={name} onChange={setName} placeholder="Full name" />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium text-gray-500">Employment</h3>
          <button
            type="button"
            onClick={() => setEmployment((prev) => [...prev, { company: "" }])}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            + Add employment
          </button>
        </div>
        {employment.length === 0 ? (
          <p className="text-sm text-gray-500">No employment records.</p>
        ) : (
          <div className="space-y-3">
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
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium text-gray-500">Education</h3>
          <button
            type="button"
            onClick={() => setEducation((prev) => [...prev, { school: "" }])}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            + Add education
          </button>
        </div>
        {education.length === 0 ? (
          <p className="text-sm text-gray-500">No education records.</p>
        ) : (
          <div className="space-y-3">
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
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-medium text-gray-500">Locations</h3>
          <button
            type="button"
            onClick={() => setLocations((prev) => [...prev, { location: "" }])}
            className="text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            + Add location
          </button>
        </div>
        {locations.length === 0 ? (
          <p className="text-sm text-gray-500">No locations.</p>
        ) : (
          <div className="space-y-3">
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
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-gray-500">
          How you met / context
        </label>
        <textarea
          value={interactionSummary}
          onChange={(e) => setInteractionSummary(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 text-gray-500">Other notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {awaitingConfirmation && (
        <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            You already have {matches.length === 1 ? "a contact" : "contacts"} named &quot;
            {checkedName}&quot;. Is this the same person?
          </p>
          <div className="space-y-2">
            {matches.map((match) => (
              <label key={match.id} className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="existingContactMatch"
                  className="mt-0.5"
                  checked={selectedContactId === match.id}
                  onChange={() => setSelectedContactId(match.id)}
                />
                <span>
                  <span className="font-medium text-gray-900">{match.name}</span>
                  {[match.employer, match.school, match.location].filter(Boolean).length > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      — {[match.employer, match.school, match.location].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </span>
              </label>
            ))}
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="existingContactMatch"
                className="mt-0.5"
                checked={selectedContactId === "new"}
                onChange={() => setSelectedContactId("new")}
              />
              <span className="font-medium text-gray-900">
                This is a different person — create a new contact
              </span>
            </label>
          </div>
          {notes.trim() && (
            <p className="text-xs text-gray-500">
              If you pick an existing contact, your &quot;Other notes&quot; will be added to
              their existing notes.
            </p>
          )}
        </div>
      )}

      {saveError && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={!trimmedName || isSaving}
          title={!trimmedName ? "Add a name before saving" : undefined}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300"
        >
          {isSaving
            ? "Saving..."
            : awaitingConfirmation
              ? "Confirm & Save"
              : "Save to CRM"}
        </button>
        {!trimmedName && <p className="text-xs text-gray-500">Add a name before saving.</p>}
      </div>
    </div>
  );
}
