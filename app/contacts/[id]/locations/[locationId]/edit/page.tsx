import { notFound } from "next/navigation";
import { getContact, getContactLocation } from "@/lib/data";
import { updateLocationAction } from "@/app/actions";
import LocationForm from "@/components/LocationForm";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string; locationId: string }>;
}) {
  const { id, locationId } = await params;
  const contact = await getContact(id);
  const location = await getContactLocation(locationId);

  if (!contact || !location || location.contactId !== id) {
    notFound();
  }

  const boundUpdateAction = updateLocationAction.bind(null, id, locationId);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Edit Location for {contact.name}
      </h1>
      <LocationForm action={boundUpdateAction} contactId={id} initialLocation={location} />
    </main>
  );
}
