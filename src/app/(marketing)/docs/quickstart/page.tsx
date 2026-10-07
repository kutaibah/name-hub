import { redirect } from 'next/navigation';

/** Alias for the in-app quickstart (same content as /docs). */
export default function DocsQuickstartPage() {
  redirect('/docs');
}
