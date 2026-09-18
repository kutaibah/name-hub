import { NameDetails } from '@/components/cns/name-details';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  return {
    title: `${decodedName} - Canton Names`,
    description: `View details for Canton Name Service entry: ${decodedName}`,
  };
}

export default async function NamePage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  
  return (
    <div className="py-8 px-4 sm:px-6">
      <NameDetails name={decodedName} />
    </div>
  );
}
