import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/BackLink";
import { ContactFooter } from "@/components/ui/ContactFooter";
import { PageShell } from "@/components/ui/PageShell";
import { ServiceList } from "@/components/services/ServiceList";
import { getCategoryBySlug } from "@/lib/services/get-catalog";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function ServicesPage({ params }: Props) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const bgImage =
    slug === "nails" ? "/assets/nails-menu.png" : "/assets/lashes-brows-menu.png";

  return (
    <PageShell backgroundImage={bgImage}>
      <BackLink />
      <ServiceList category={category} />
      <ContactFooter />
    </PageShell>
  );
}
