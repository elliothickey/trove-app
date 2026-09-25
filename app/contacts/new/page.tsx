import ContactForm from "@/components/ContactForm";
import { createContactAction } from "@/app/actions";
import FormPage from "@/components/FormPage";

export default function NewContactPage() {
  return (
    <FormPage
      title="Add person"
      backHref="/"
      backLabel="Back to people"
    >
      <ContactForm action={createContactAction} />
    </FormPage>
  );
}
