import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createLocationAction } from "@/app/actions";
import LocationForm from "@/components/LocationForm";
import FormPage from "@/components/FormPage";

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
    <FormPage
      title="Add location"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <LocationForm action={boundCreateAction} contactId={id} />
    </FormPage>
  );
}
