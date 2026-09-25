"use client";

import { useActionState } from "react";
import type { ActionFormState } from "@/app/actions";
import type { Interaction, InteractionType } from "@/lib/types";
import { useIsClient } from "@/lib/useIsClient";
import FormActions from "@/components/FormActions";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";

const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "message", label: "Message" },
  { value: "other", label: "Other" },
];

type InteractionFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialInteraction?: Interaction;
};

const initialState: ActionFormState = {};

// Browser-local "YYYY-MM-DDTHH:mm" for a datetime-local input. Must only run
// in the browser: on the server it would use the server's timezone.
function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function InteractionForm({
  action,
  contactId,
  initialInteraction,
}: InteractionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isClient = useIsClient();

  const initialOccurredAtLocal = initialInteraction
    ? toDatetimeLocalValue(initialInteraction.occurredAt)
    : undefined;
  const defaultOccurredAtLocal = isClient
    ? (state.values?.occurredAtLocal ??
      initialOccurredAtLocal ??
      toDatetimeLocalValue(new Date().toISOString()))
    : undefined;

  // The datetime-local input's value has no timezone, and the server may not
  // share the user's timezone -- so convert it to an unambiguous ISO instant
  // here in the browser, where it's interpreted in the user's local time,
  // before the form reaches the server action.
  function submit(formData: FormData) {
    const local = String(formData.get("occurredAtLocal") ?? "");
    if (initialInteraction && local === initialOccurredAtLocal) {
      // Date/time left unchanged: keep the stored instant exactly, including
      // any seconds the minute-precision input can't show.
      formData.set("occurredAt", initialInteraction.occurredAt);
    } else {
      const date = new Date(local);
      if (!Number.isNaN(date.getTime())) {
        formData.set("occurredAt", date.toISOString());
      }
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Type" htmlFor="type">
          <Select
            id="type"
            name="type"
            defaultValue={state.values?.type ?? initialInteraction?.type ?? "meeting"}
          >
            {INTERACTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Date & time" htmlFor="occurredAtLocal">
          {/* Keyed on isClient so it remounts with the browser-local default
              once hydrated; the server render stays empty and disabled. */}
          <Input
            key={isClient ? "client" : "server"}
            id="occurredAtLocal"
            name="occurredAtLocal"
            type="datetime-local"
            defaultValue={defaultOccurredAtLocal}
            disabled={!isClient}
            required
          />
        </Field>
      </div>

      <Field label="Summary" htmlFor="summary">
        <Input
          id="summary"
          name="summary"
          type="text"
          placeholder="e.g. Coffee to catch up before her move"
          defaultValue={state.values?.summary ?? initialInteraction?.summary}
          required
        />
      </Field>

      <Field label="Location" htmlFor="location">
        <Input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Zoom, Brown campus, McKinsey office"
          defaultValue={state.values?.location ?? initialInteraction?.location}
        />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={state.values?.notes ?? initialInteraction?.notes}
        />
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormActions isPending={isPending} cancelHref={`/contacts/${contactId}`} />
    </form>
  );
}
