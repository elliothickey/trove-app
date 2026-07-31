import Link from "next/link";
import type { Contact } from "@/lib/types";

type ContactFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  initialContact?: Contact;
};

export default function ContactForm({ action, initialContact }: ContactFormProps) {
  return (
    <form action={action} className="space-y-4">
      <Field label="Name" name="name" defaultValue={initialContact?.name} required />
      <Field label="Employer" name="employer" defaultValue={initialContact?.employer} />
      <Field label="School" name="school" defaultValue={initialContact?.school} />
      <Field label="Location" name="location" defaultValue={initialContact?.location} />
      <Field
        label="Tags (comma separated)"
        name="tags"
        defaultValue={initialContact?.tags.join(", ")}
      />
      <Field label="Email" name="email" type="email" defaultValue={initialContact?.email} />
      <Field label="Phone" name="phone" defaultValue={initialContact?.phone} />
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={initialContact?.notes}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Save
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
