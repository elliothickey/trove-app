import { notFound } from "next/navigation";
import { getContact, getInteraction } from "@/lib/data";
import { updateInteractionAction } from "@/app/actions";
import InteractionForm from "@/components/InteractionForm";
import FormPage from "@/components/FormPage";

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
    <FormPage
      title="Edit interaction"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <InteractionForm
        action={boundUpdateAction}
        contactId={id}
        initialInteraction={interaction}
      />
    </FormPage>
  );
}
