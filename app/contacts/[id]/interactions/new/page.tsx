import { notFound } from "next/navigation";
import { getContact } from "@/lib/data";
import { createInteractionAction } from "@/app/actions";
import InteractionForm from "@/components/InteractionForm";
import FormPage from "@/components/FormPage";

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
    <FormPage
      title="Log interaction"
      backHref={`/contacts/${id}`}
      backLabel={`Back to ${contact.name}`}
    >
      <InteractionForm action={boundCreateAction} contactId={id} />
    </FormPage>
  );
}
