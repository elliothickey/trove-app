import QuickCaptureForm from "@/components/QuickCaptureForm";

export default function QuickCapturePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-[13px] font-medium text-ink-muted">Quick Capture</h1>
        <p className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-ink">
          Tell Trove what happened.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Write naturally. Trove will organize the details before anything is saved.
        </p>
      </div>
      <QuickCaptureForm />
    </main>
  );
}
