import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createEducationAction } from "@/app/actions";
import EducationForm from "@/components/EducationForm";
import FormPage from "@/components/FormPage";

export default async function NewEducationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const boundCreateAction = createEducationAction.bind(null, id);

  return (
    <FormPage
      title="Add education"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <EducationForm action={boundCreateAction} contactId={id} />
    </FormPage>
  );
}
