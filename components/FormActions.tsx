import Link from "next/link";
import Button, { buttonStyles } from "@/components/ui/Button";

// Save + Cancel row shared by the add/edit forms.
export default function FormActions({
  isPending,
  cancelHref,
}: {
  isPending: boolean;
  cancelHref: string;
}) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
      <Link href={cancelHref} className={buttonStyles({ variant: "ghost" })}>
        Cancel
      </Link>
    </div>
  );
}
