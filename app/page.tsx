import Link from "next/link";
import { getContactsForList } from "@/lib/data";
import SearchBar from "@/components/SearchBar";
import { buttonStyles } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { CaptureIcon, PlusIcon } from "@/components/ui/icons";
import PageHeader from "@/components/ui/PageHeader";

export default async function HomePage() {
  const contacts = await getContactsForList();
  const count = contacts.length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title="People"
        description={
          count > 0 ? `${count} ${count === 1 ? "person" : "people"} in your world` : undefined
        }
        actions={
          <Link href="/contacts/new" className={buttonStyles()}>
            <PlusIcon />
            Add person
          </Link>
        }
      />
      {count === 0 ? (
        <EmptyState
          title="Start with someone you've met"
          description="Paste a quick note about them and Quick Capture will pull out the details, or add them yourself."
          actions={
            <>
              <Link href="/quick-capture" className={buttonStyles()}>
                <CaptureIcon />
                Quick Capture
              </Link>
              <Link href="/contacts/new" className={buttonStyles({ variant: "secondary" })}>
                Add a person
              </Link>
            </>
          }
        />
      ) : (
        <SearchBar contacts={contacts} />
      )}
    </main>
  );
}
