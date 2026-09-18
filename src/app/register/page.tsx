import { Suspense } from 'react';
import { RegistrationFlow } from '@/components/cns/registration-flow';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Register Name - Canton Names',
  description: 'Register a new Canton Name Service (CNS) name for your Canton Network identity.',
};

function RegistrationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="py-8 px-4 sm:px-6">
      <Suspense fallback={<RegistrationSkeleton />}>
        <RegistrationFlow />
      </Suspense>
    </div>
  );
}
