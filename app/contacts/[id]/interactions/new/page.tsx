import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createInteractionAction } from "@/app/actions";
import InteractionForm from "@/components/InteractionForm";

export default async function NewInteractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const boundCreateAction = createInteractionAction.bind(null, id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Log Interaction with {contact.name}
      </h1>
      <InteractionForm action={boundCreateAction} contactId={id} />
    </main>
  );
}
