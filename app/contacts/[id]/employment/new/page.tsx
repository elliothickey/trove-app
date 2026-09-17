import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createEmploymentAction } from "@/app/actions";
import EmploymentForm from "@/components/EmploymentForm";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Add Employment for {contact.name}
      </h1>
      <EmploymentForm action={boundCreateAction} contactId={id} />
    </main>
  );
}
