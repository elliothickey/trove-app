import Link from "next/link";
import type { Contact } from "@/lib/types";

export default function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Link
      href={`/contacts/${contact.id}`}
      className="block rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition"
    >
      <p className="font-medium text-gray-900">{contact.name}</p>
      <p className="text-sm text-gray-600">
        {[contact.employer, contact.location].filter(Boolean).join(" · ") || "No details yet"}
      </p>
      {contact.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
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
    </Link>
  );
}
