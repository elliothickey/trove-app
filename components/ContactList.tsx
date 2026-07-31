import type { Contact } from "@/lib/types";
import ContactCard from "@/components/ContactCard";

export default function ContactList({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No contacts match your search.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
}
