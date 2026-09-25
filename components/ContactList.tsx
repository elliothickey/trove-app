import type { ContactListItem } from "@/lib/types";
import ContactCard from "@/components/ContactCard";

export default function ContactList({ contacts }: { contacts: ContactListItem[] }) {
  if (contacts.length === 0) {
    return <p className="py-16 text-center text-sm text-ink-muted">No people match your search.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {contacts.map((contact) => (
        <li key={contact.id}>
          <ContactCard contact={contact} />
        </li>
      ))}
    </ul>
  );
}
