"use client";

import { useMemo, useState } from "react";
import type { ContactListItem } from "@/lib/types";
import { normalizeText } from "@/lib/textMatch";
import ContactList from "@/components/ContactList";

export default function SearchBar({ contacts }: { contacts: ContactListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return contacts;

    return contacts.filter((contact) => contact.searchText.includes(q));
  }, [contacts, query]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name, employer, school, location, or tag..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
      <ContactList contacts={filtered} />
    </div>
  );
}
