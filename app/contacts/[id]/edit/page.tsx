import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { updateContactAction } from "@/app/actions";
import ContactForm from "@/components/ContactForm";

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
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Edit Contact</h1>
      <ContactForm action={boundUpdateAction} initialContact={contact} />
    </main>
  );
}
