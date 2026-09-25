import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { updateContactAction } from "@/app/actions";
import ContactForm from "@/components/ContactForm";
import FormPage from "@/components/FormPage";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const boundUpdateAction = updateContactAction.bind(null, id);

  return (
    <FormPage
      title="Edit person"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <ContactForm action={boundUpdateAction} initialContact={contact} />
    </FormPage>
  );
}
