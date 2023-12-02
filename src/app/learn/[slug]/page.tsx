import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { slug: string } }) {
  return <Card className="h-full flex flex-1">{params.slug}</Card>;
}
