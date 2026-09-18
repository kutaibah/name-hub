import { RecipientShowcase } from '@/components/cns/recipient-showcase';

export const metadata = {
  title: 'Integration Demo - Canton Names',
  description: 'Demonstration of the reusable CnsRecipientInput component for Canton Network applications.',
};

export default function RecipientDemoPage() {
  return (
    <div className="py-8 px-4 sm:px-6">
      <RecipientShowcase />
    </div>
  );
}
