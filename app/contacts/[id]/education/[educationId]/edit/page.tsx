import { notFound } from "next/navigation";
import { getContact, getContactEducation } from "@/lib/data";
import { updateEducationAction } from "@/app/actions";
import EducationForm from "@/components/EducationForm";
import FormPage from "@/components/FormPage";

export default async function EditEducationPage({
  params,
}: {
  params: Promise<{ id: string; educationId: string }>;
}) {
  const { id, educationId } = await params;
  const contact = await getContact(id);
  const education = await getContactEducation(educationId);

  if (!contact || !education || education.contactId !== id) {
    notFound();
  }

  const boundUpdateAction = updateEducationAction.bind(null, id, educationId);

  return (
    <FormPage
      title="Edit education"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <EducationForm action={boundUpdateAction} contactId={id} initialEducation={education} />
    </FormPage>
  );
}
