import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createEmploymentAction } from "@/app/actions";
import EmploymentForm from "@/components/EmploymentForm";
import FormPage from "@/components/FormPage";

export default async function NewEmploymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const boundCreateAction = createEmploymentAction.bind(null, id);

  return (
    <FormPage
      title="Add employment"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <EmploymentForm action={boundCreateAction} contactId={id} />
    </FormPage>
  );
}
