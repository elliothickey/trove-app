"use client";

import { useActionState, useState } from "react";
import type { ActionFormState } from "@/app/actions";
import type { ContactEmployment } from "@/lib/types";
import FormActions from "@/components/FormActions";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";

type EmploymentFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialEmployment?: ContactEmployment;
};

const initialState: ActionFormState = {};

export default function EmploymentForm({
  action,
  contactId,
  initialEmployment,
}: EmploymentFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isCurrent, setIsCurrent] = useState(initialEmployment?.isCurrent ?? false);
  const [endDate, setEndDate] = useState(initialEmployment?.endDate ?? "");

  return (
    <form action={formAction} className="space-y-5">
      {/* Carries through an "as written" date (e.g. from Quick Capture) that
          has no exact date yet, so a routine edit here doesn't silently wipe
          it. parseEmploymentInput() only keeps this value when the matching
          exact date field above is left blank. */}
      <input type="hidden" name="startDateText" value={initialEmployment?.startDateText ?? ""} />
      <input type="hidden" name="endDateText" value={initialEmployment?.endDateText ?? ""} />
      <Field label="Company" htmlFor="company">
        <Input
          id="company"
          name="company"
          type="text"
          defaultValue={state.values?.company ?? initialEmployment?.company}
          required
        />
      </Field>

      <Field label="Role" htmlFor="role">
        <Input
          id="role"
          name="role"
          type="text"
          defaultValue={state.values?.role ?? initialEmployment?.role}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={state.values?.startDate ?? initialEmployment?.startDate}
          />
        </Field>
        <Field label="End date" htmlFor="endDate">
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isCurrent}
          />
        </Field>
      </div>

      <div className="flex items-center gap-2.5">
        <input
          id="isCurrent"
          name="isCurrent"
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => {
            setIsCurrent(e.target.checked);
            if (e.target.checked) {
              setEndDate("");
            }
          }}
          className="size-4 accent-ink"
        />
        <label className="text-sm text-ink" htmlFor="isCurrent">
          This is their current job
        </label>
      </div>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormActions isPending={isPending} cancelHref={`/contacts/${contactId}`} />
    </form>
  );
}
