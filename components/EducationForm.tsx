"use client";

import { useActionState } from "react";
import type { ActionFormState } from "@/app/actions";
import type { ContactEducation } from "@/lib/types";
import FormActions from "@/components/FormActions";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";

type EducationFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialEducation?: ContactEducation;
};

const initialState: ActionFormState = {};

export default function EducationForm({ action, contactId, initialEducation }: EducationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Carries through an "as written" date (e.g. from Quick Capture) that
          has no exact date yet, so a routine edit here doesn't silently wipe
          it. parseEducationInput() only keeps this value when the matching
          exact date field below is left blank. */}
      <input type="hidden" name="startDateText" value={initialEducation?.startDateText ?? ""} />
      <input type="hidden" name="endDateText" value={initialEducation?.endDateText ?? ""} />
      <Field label="School" htmlFor="school">
        <Input
          id="school"
          name="school"
          type="text"
          defaultValue={state.values?.school ?? initialEducation?.school}
          required
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Degree" htmlFor="degree">
          <Input
            id="degree"
            name="degree"
            type="text"
            placeholder="e.g. B.A."
            defaultValue={state.values?.degree ?? initialEducation?.degree}
          />
        </Field>
        <Field label="Field of study" htmlFor="fieldOfStudy">
          <Input
            id="fieldOfStudy"
            name="fieldOfStudy"
            type="text"
            defaultValue={state.values?.fieldOfStudy ?? initialEducation?.fieldOfStudy}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={state.values?.startDate ?? initialEducation?.startDate}
          />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={state.values?.endDate ?? initialEducation?.endDate}
          />
        </Field>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormActions isPending={isPending} cancelHref={`/contacts/${contactId}`} />
    </form>
  );
}
