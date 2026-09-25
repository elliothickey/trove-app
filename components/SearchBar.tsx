"use client";

import { useMemo, useState } from "react";
import type { ContactListItem } from "@/lib/types";
import { normalizeText } from "@/lib/textMatch";
import ContactList from "@/components/ContactList";
import Input from "@/components/ui/Input";
import { SearchIcon } from "@/components/ui/icons";

export default function SearchBar({ contacts }: { contacts: ContactListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return contacts;

    return contacts.filter((contact) => contact.searchText.includes(q));
  }, [contacts, query]);

  return (
    <div>
      <div className="relative mb-6">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search people..."
          aria-label="Search people"
          className="pl-9"
        />
      </div>
      <ContactList contacts={filtered} />
    </div>
  );
}
