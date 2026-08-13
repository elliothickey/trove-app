import Link from "next/link";
import { notFound } from "next/navigation";
import { getContact, getInteractionsForContact } from "@/lib/data";
import DeleteButton from "@/components/DeleteButton";
import InteractionTimeline from "@/components/InteractionTimeline";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const interactions = await getInteractionsForContact(id);

  const details: { label: string; value?: string }[] = [
    { label: "Employer", value: contact.employer },
    { label: "School", value: contact.school },
    { label: "Location", value: contact.location },
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to contacts
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{contact.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Edit
          </Link>
          <DeleteButton id={contact.id} name={contact.name} />
        </div>
      </div>

      {contact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <dl className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {details
          .filter((detail) => detail.value)
          .map((detail) => (
            <div key={detail.label} className="flex justify-between px-4 py-3 text-sm">
              <dt className="text-gray-500">{detail.label}</dt>
              <dd className="text-gray-900">{detail.value}</dd>
            </div>
          ))}
      </dl>

      {contact.notes && (
        <div className="mt-6">
          <h2 className="mb-1 text-sm font-medium text-gray-500">Notes</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-900">{contact.notes}</p>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500">Timeline</h2>
          <Link
            href={`/contacts/${contact.id}/interactions/new`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            + Log Interaction
          </Link>
        </div>
        <InteractionTimeline contactId={contact.id} interactions={interactions} />
      </div>
    </main>
  );
}
