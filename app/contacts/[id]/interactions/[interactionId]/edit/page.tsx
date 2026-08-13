import { notFound } from "next/navigation";
import { getContact, getInteraction } from "@/lib/data";
import { updateInteractionAction } from "@/app/actions";
import InteractionForm from "@/components/InteractionForm";

export default async function EditInteractionPage({
  params,
}: {
  params: Promise<{ id: string; interactionId: string }>;
}) {
  const { id, interactionId } = await params;
  const contact = await getContact(id);
  const interaction = await getInteraction(interactionId);

  if (!contact || !interaction || interaction.contactId !== id) {
    notFound();
  }

  const boundUpdateAction = updateInteractionAction.bind(null, id, interactionId);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Edit Interaction with {contact.name}
      </h1>
      <InteractionForm
        action={boundUpdateAction}
        contactId={id}
        initialInteraction={interaction}
      />
    </main>
  );
}
