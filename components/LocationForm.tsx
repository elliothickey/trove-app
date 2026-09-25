"use client";

import { useActionState } from "react";
import type { ActionFormState } from "@/app/actions";
import type { ContactLocation, ContactLocationKind } from "@/lib/types";
import FormActions from "@/components/FormActions";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const LOCATION_KIND_OPTIONS: { value: ContactLocationKind | ""; label: string }[] = [
  { value: "", label: "Unspecified" },
  { value: "hometown", label: "Hometown" },
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

type LocationFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialLocation?: ContactLocation;
};

const initialState: ActionFormState = {};

export default function LocationForm({ action, contactId, initialLocation }: LocationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Location" htmlFor="location">
        <Input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Boston, MA"
          defaultValue={state.values?.location ?? initialLocation?.location}
          required
        />
      </Field>

      <Field label="Type" htmlFor="kind">
        <Select
          id="kind"
          name="kind"
          defaultValue={state.values?.kind ?? initialLocation?.kind ?? ""}
        >
          {LOCATION_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormActions isPending={isPending} cancelHref={`/contacts/${contactId}`} />
    </form>
  );
}
