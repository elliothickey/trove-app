import QuickCaptureForm from "@/components/QuickCaptureForm";

export default function QuickCapturePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Quick Capture</h1>
      <p className="mb-6 text-sm text-gray-500">
        Paste a messy note about someone you just met. AI will pull out structured details for
        you to review and edit before anything is saved to your contacts.
      </p>
      <QuickCaptureForm />
    </main>
  );
}
