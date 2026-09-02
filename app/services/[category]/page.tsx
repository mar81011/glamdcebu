import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ category: string }>;
}

export default async function ServicesPage({ params }: Props) {
  const { category: slug } = await params;
  redirect(`/#${slug}`);
}
