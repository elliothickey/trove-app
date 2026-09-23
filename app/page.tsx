import Link from "next/link";
import { getContactsForList } from "@/lib/data";
import SearchBar from "@/components/SearchBar";

export default async function HomePage() {
  const contacts = await getContactsForList();

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
      {contacts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center">
          <p className="font-medium text-gray-900">No contacts yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Paste a note about someone you&apos;ve met and Quick Capture will pull out the
            details for you, or add a contact yourself.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/quick-capture"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Quick Capture
            </Link>
            <Link
              href="/contacts/new"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Add a contact
            </Link>
          </div>
        </div>
      ) : (
        <SearchBar contacts={contacts} />
      )}
    </main>
  );
}
