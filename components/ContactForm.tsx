"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionFormState } from "@/app/actions";
import type { Contact } from "@/lib/types";

type ContactFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  initialContact?: Contact;
};

const initialState: ActionFormState = {};

export default function ContactForm({ action, initialContact }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Name" name="name" defaultValue={state.values?.name ?? initialContact?.name} required />
      <Field
        label="Employer"
        name="employer"
        defaultValue={state.values?.employer ?? initialContact?.employer}
      />
      <Field label="School" name="school" defaultValue={state.values?.school ?? initialContact?.school} />
      <Field
        label="Location"
        name="location"
        defaultValue={state.values?.location ?? initialContact?.location}
      />
      <Field
        label="Tags (comma separated)"
        name="tags"
        defaultValue={state.values?.tags ?? initialContact?.tags.join(", ")}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={state.values?.email ?? initialContact?.email}
      />
      <Field label="Phone" name="phone" defaultValue={state.values?.phone ?? initialContact?.phone} />
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={state.values?.notes ?? initialContact?.notes}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <Link
          href="/"
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}
