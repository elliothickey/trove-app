import { notFound } from "next/navigation";
import { getContact, getContactEmployment } from "@/lib/data";
import { updateEmploymentAction } from "@/app/actions";
import EmploymentForm from "@/components/EmploymentForm";
import FormPage from "@/components/FormPage";

export default async function EditEmploymentPage({
  params,
}: {
  params: Promise<{ id: string; employmentId: string }>;
}) {
  const { id, employmentId } = await params;
  const contact = await getContact(id);
  const employment = await getContactEmployment(employmentId);

  if (!contact || !employment || employment.contactId !== id) {
    notFound();
  }

  const boundUpdateAction = updateEmploymentAction.bind(null, id, employmentId);

  return (
    <FormPage
      title="Edit employment"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <EmploymentForm action={boundUpdateAction} contactId={id} initialEmployment={employment} />
    </FormPage>
  );
}
