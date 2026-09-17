import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createEducationAction } from "@/app/actions";
import EducationForm from "@/components/EducationForm";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Add Education for {contact.name}
      </h1>
      <EducationForm action={boundCreateAction} contactId={id} />
    </main>
  );
}
