import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getContact,
  getEducationForContact,
  getEmploymentForContact,
  getInteractionsForContact,
  getLocationsForContact,
} from "@/lib/data";
import { resolveContactSubtitle } from "@/lib/contactSubtitle";
import type { ContactLocation } from "@/lib/types";
import DeleteButton from "@/components/DeleteButton";
import EducationList from "@/components/EducationList";
import EmploymentList from "@/components/EmploymentList";
import InteractionTimeline from "@/components/InteractionTimeline";
import LocalDateTime from "@/components/LocalDateTime";
import LocationList from "@/components/LocationList";
import ProfileSection from "@/components/ProfileSection";
import Avatar from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PlusIcon } from "@/components/ui/icons";
import Tag from "@/components/ui/Tag";

// Header actions use the compact "sm" button on phones and the standard
// size from the sm breakpoint up.
const headerActionSizing = "sm:h-9 sm:gap-2 sm:px-3.5 sm:text-sm";

// resolveContactSubtitle's fallback when a contact has nothing to show.
const EMPTY_SUBTITLE = "No details yet";

// "Based in …" / "From …" phrases, taken only from location records whose
// kind says so, falling back to the contact's own location field.
function placeSummary(locations: ContactLocation[], legacyLocation?: string): string[] {
  const current = locations.find((item) => item.kind === "current");
  const hometown = locations.find((item) => item.kind === "hometown");
  const parts: string[] = [];
  if (current) parts.push(`Based in ${current.location}`);
  if (hometown) parts.push(`From ${hometown.location}`);
  if (parts.length === 0 && legacyLocation) parts.push(legacyLocation);
  return parts;
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  const interactions = await getInteractionsForContact(id);
  const employment = await getEmploymentForContact(id);
  const education = await getEducationForContact(id);
  const locations = await getLocationsForContact(id);

  const details: { label: string; value?: string }[] = [
    { label: "Employer", value: contact.employer },
    { label: "School", value: contact.school },
    { label: "Location", value: contact.location },
    { label: "Email", value: contact.email },
    { label: "Phone", value: contact.phone },
  ];
  const visibleDetails = details.filter((detail) => detail.value);

  // Same headline the People card shows, minus locations (shown separately).
  const subtitle = resolveContactSubtitle({
    employment,
    education,
    locations: [],
    legacyEmployer: contact.employer,
  });
  const headline = subtitle === EMPTY_SUBTITLE ? undefined : subtitle;
  const places = placeSummary(locations, contact.location);
  // Interactions are ordered newest first.
  const lastInteraction = interactions[0];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-8 sm:py-10">
      <Link href="/" className="rounded-sm text-[13px] text-ink-muted transition-colors hover:text-ink">
        &larr; Back to people
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <Avatar
            name={contact.name}
            seed={contact.id}
            className="size-11 text-[15px] sm:size-14 sm:text-lg"
          />
          <div className="min-w-0 pt-0.5">
            <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
              {contact.name}
            </h1>
            {headline && (
              <p className="mt-0.5 text-sm text-ink-muted sm:mt-1 sm:text-[15px]">{headline}</p>
            )}
            {(places.length > 0 || lastInteraction) && (
              <p className="mt-1 text-xs leading-5 text-ink-subtle sm:mt-1.5 sm:text-[13px] sm:leading-normal">
                {places.join(" · ")}
                {lastInteraction && (
                  <span className="whitespace-nowrap">
                    {places.length > 0 && " · "}
                    Last interaction{" "}
                    <LocalDateTime
                      iso={lastInteraction.occurredAt}
                      options={{ dateStyle: "medium" }}
                    />
                  </span>
                )}
              </p>
            )}
            {contact.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3">
                {contact.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/contacts/${contact.id}/edit`}
            className={buttonStyles({ variant: "secondary", size: "sm", className: headerActionSizing })}
          >
            Edit person
          </Link>
          <Link
            href={`/contacts/${contact.id}/interactions/new`}
            className={buttonStyles({ size: "sm", className: headerActionSizing })}
          >
            <PlusIcon />
            Log interaction
          </Link>
        </div>
      </header>

      <div className="mt-6 grid gap-8 sm:mt-10 sm:gap-10 lg:grid-cols-[18.5rem_minmax(0,1fr)] lg:gap-12">
        <aside className="min-w-0 space-y-4">
          <Card className="divide-y divide-line">
            {contact.notes && (
              <ProfileSection title="About">
                {/* Split only at blank lines so paragraph spacing can tighten
                    on phones; each paragraph's text renders exactly as stored. */}
                <div className="space-y-2 text-[13px] leading-6 text-ink sm:space-y-[1lh] sm:text-sm sm:leading-relaxed">
                  {contact.notes.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-wrap break-words">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ProfileSection>
            )}
            <ProfileSection
              title="Work"
              addHref={`/contacts/${contact.id}/employment/new`}
              addLabel="Add employment"
            >
              <EmploymentList contactId={contact.id} employment={employment} />
            </ProfileSection>
            <ProfileSection
              title="Education"
              addHref={`/contacts/${contact.id}/education/new`}
              addLabel="Add education"
            >
              <EducationList contactId={contact.id} education={education} />
            </ProfileSection>
            <ProfileSection
              title="Locations"
              addHref={`/contacts/${contact.id}/locations/new`}
              addLabel="Add location"
            >
              <LocationList contactId={contact.id} locations={locations} />
            </ProfileSection>
            {visibleDetails.length > 0 && (
              <ProfileSection title="Details">
                <dl className="space-y-2">
                  {visibleDetails.map((detail) => (
                    <div key={detail.label} className="flex justify-between gap-4 text-[13px]">
                      <dt className="shrink-0 text-ink-subtle">{detail.label}</dt>
                      <dd className="min-w-0 break-words text-right text-ink">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </ProfileSection>
            )}
          </Card>
          <div className="px-1">
            <DeleteButton id={contact.id} name={contact.name} />
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-5 flex items-baseline justify-between gap-3 sm:mb-6">
            <h2 className="text-sm font-semibold text-ink">Timeline</h2>
            {interactions.length > 0 && (
              <span className="text-[13px] text-ink-subtle">
                {interactions.length} {interactions.length === 1 ? "interaction" : "interactions"}
              </span>
            )}
          </div>
          <InteractionTimeline contactId={contact.id} interactions={interactions} />
        </section>
      </div>
    </main>
  );
}
