import Link from "next/link";
import { getContacts } from "@/lib/data";
import SearchBar from "@/components/SearchBar";

export default async function HomePage() {
  const contacts = await getContacts();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
        <Link
          href="/contacts/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          + New Contact
        </Link>
      </div>
      <SearchBar contacts={contacts} />
    </main>
  );
}
