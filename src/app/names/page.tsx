import { MyNamesList } from '@/components/cns/my-names-list';

export const metadata = {
  title: 'My Names - Canton Names',
  description: 'View and manage your registered Canton Name Service (CNS) names.',
};

export default function NamesPage() {
  return (
    <div className="py-8 px-4 sm:px-6">
      <MyNamesList />
    </div>
  );
}
