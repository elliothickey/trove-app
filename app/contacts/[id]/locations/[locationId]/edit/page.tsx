import { notFound } from "next/navigation";
import { getContact, getContactLocation } from "@/lib/data";
import { updateLocationAction } from "@/app/actions";
import LocationForm from "@/components/LocationForm";
import FormPage from "@/components/FormPage";

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
    <FormPage
      title="Edit location"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <LocationForm action={boundUpdateAction} contactId={id} initialLocation={location} />
    </FormPage>
  );
}
