import ContactForm from "@/components/ContactForm";
import { createContactAction } from "@/app/actions";

export default function NewContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">New Contact</h1>
      <ContactForm action={createContactAction} />
    </main>
  );
}
