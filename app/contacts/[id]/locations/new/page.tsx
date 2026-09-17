import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createLocationAction } from "@/app/actions";
import LocationForm from "@/components/LocationForm";

export default async function NewLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const boundCreateAction = createLocationAction.bind(null, id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Add Location for {contact.name}
      </h1>
      <LocationForm action={boundCreateAction} contactId={id} />
    </main>
  );
}
