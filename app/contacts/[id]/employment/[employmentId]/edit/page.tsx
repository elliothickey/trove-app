import { notFound } from "next/navigation";
import { getContact, getContactEmployment } from "@/lib/data";
import { updateEmploymentAction } from "@/app/actions";
import EmploymentForm from "@/components/EmploymentForm";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Edit Employment for {contact.name}
      </h1>
      <EmploymentForm action={boundUpdateAction} contactId={id} initialEmployment={employment} />
    </main>
  );
}
