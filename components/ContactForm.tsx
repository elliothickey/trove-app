"use client";

import { useActionState } from "react";
import type { ActionFormState } from "@/app/actions";
import type { Contact } from "@/lib/types";
import FormActions from "@/components/FormActions";
import Alert from "@/components/ui/Alert";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";

type ContactFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  initialContact?: Contact;
};

const initialState: ActionFormState = {};

export default function ContactForm({ action, initialContact }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Name" htmlFor="name">
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={state.values?.name ?? initialContact?.name}
          required
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Employer" htmlFor="employer">
          <Input
            id="employer"
            name="employer"
            type="text"
            defaultValue={state.values?.employer ?? initialContact?.employer}
          />
        </Field>
        <Field label="School" htmlFor="school">
          <Input
            id="school"
            name="school"
            type="text"
            defaultValue={state.values?.school ?? initialContact?.school}
          />
        </Field>
      </div>
      <Field label="Location" htmlFor="location">
        <Input
          id="location"
          name="location"
          type="text"
          defaultValue={state.values?.location ?? initialContact?.location}
        />
      </Field>
      <Field label="Tags" htmlFor="tags" hint="Separate tags with commas.">
        <Input
          id="tags"
          name="tags"
          type="text"
          defaultValue={state.values?.tags ?? initialContact?.tags.join(", ")}
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={state.values?.email ?? initialContact?.email}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="text"
            defaultValue={state.values?.phone ?? initialContact?.phone}
          />
        </Field>
      </div>
      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={state.values?.notes ?? initialContact?.notes}
        />
      </Field>

      {state.error && <Alert tone="error">{state.error}</Alert>}

      <FormActions isPending={isPending} cancelHref="/" />
    </form>
  );
}
