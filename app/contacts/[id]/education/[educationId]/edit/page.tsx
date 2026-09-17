import { notFound } from "next/navigation";
import { getContact, getContactEducation } from "@/lib/data";
import { updateEducationAction } from "@/app/actions";
import EducationForm from "@/components/EducationForm";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Edit Education for {contact.name}
      </h1>
      <EducationForm action={boundUpdateAction} contactId={id} initialEducation={education} />
    </main>
  );
}
