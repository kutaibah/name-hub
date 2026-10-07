'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ExternalLink, ArrowRight } from 'lucide-react';
import '@/lib/cns/resolver-init';
import '@canton-names/resolver/styles.css';
import { ResolverPlayground } from './resolver-playground';
import { CopySnippet, CodeBlock } from './copy-snippet';

const NPM_INSTALL = 'npm i @canton-names/resolver';
const GITHUB_REPO = 'https://github.com/kutaibah/name-hub';
const NPM_PACKAGE = 'https://www.npmjs.com/package/@canton-names/resolver';

const REACT_QUICKSTART = `'use client';

import { useState } from 'react';
import { configureResolver } from '@canton-names/resolver';
import { CnsRecipientInput } from '@canton-names/resolver/react';
import '@canton-names/resolver/styles.css';

configureResolver({ mode: 'demo' });

export function TransferForm() {
  const [partyId, setPartyId] = useState<string | null>(null);

  return (
    <form>
      <CnsRecipientInput
        label="Recipient"
        onChange={({ partyId }) => setPartyId(partyId)}
      />
      <button type="submit" disabled={!partyId}>Send</button>
    </form>
  );
}`;

const HEADLESS_QUICKSTART = `import { configureResolver, resolve } from '@canton-names/resolver';

configureResolver({ mode: 'demo' });

const result = await resolve('bank');
// result.status: ok | missing | expired | unverified | changed
// result.reasonCode: OK | NAME_NOT_FOUND | ...`;

export function DeveloperHome() {
  return (
    <>
      {/* Hero + demo above the fold */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-2">@canton-names/resolver</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
                Safe recipient resolution for Canton apps
              </h1>
              <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                Drop-in <code className="text-sm bg-gray-100 px-1 rounded">CnsRecipientInput</code> and{' '}
                <code className="text-sm bg-gray-100 px-1 rounded">resolve()</code> return typed status and
                reason codes so your app can confirm or block before every transfer.
              </p>

              <div className="mt-6 space-y-3">
                <CopySnippet value={NPM_INSTALL} label="Copy install command" />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Link
                    href="/docs"
                    className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Read the quickstart
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <span className="text-gray-300">|</span>
                  <a
                    href={NPM_PACKAGE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                  >
                    npm
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                  <a
                    href={GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                  >
                    GitHub
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div id="demo" className="scroll-mt-20">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Live demo (demo mode)
              </p>
              <ResolverPlayground compact />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-gray-50/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3">
          <p className="text-center text-sm text-gray-600">
            <span className="font-medium text-indigo-600">Lookup is the product.</span> Registration is support.{' '}
            <span className="font-medium text-indigo-600">Safety is the differentiator.</span>
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <HowCard
              title="CnsRecipientInput"
              body="React field with debounced lookup, badges, and confirm-before-send for risky states."
            />
            <HowCard
              title="resolve()"
              body="Headless async API with the same ResolveResult contract for wallets, CLIs, or custom UI."
            />
            <HowCard
              title="Safe states"
              body={
                <>
                  <code className="text-xs">ok</code> is usable immediately.{' '}
                  <code className="text-xs">unverified</code> and <code className="text-xs">changed</code> need
                  confirmation. <code className="text-xs">missing</code> and <code className="text-xs">expired</code>{' '}
                  block the send.
                </>
              }
            />
            <HowCard
              title="Confirm before send"
              body="Only risky resolutions ask the user to opt in; verified names never show a false “verified” label on unverified entries."
            />
          </div>
        </div>
      </section>

      {/* Quickstart */}
      <section id="quickstart" className="scroll-mt-20 border-b border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">Quickstart</h2>
          <p className="mt-2 text-gray-600">Install, configure demo mode, paste into your transfer form.</p>

          <div className="mt-6">
            <CopySnippet value={NPM_INSTALL} className="max-w-md" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <CodeBlock title="React component" code={REACT_QUICKSTART} />
            <CodeBlock title="Headless resolve()" code={HEADLESS_QUICKSTART} />
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Full status table, reason codes, and live mode setup:{' '}
            <Link href="/docs" className="text-indigo-600 font-medium hover:underline">
              documentation
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Proof / demo mode */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold text-gray-900">Demo mode on this site</h2>
          <div className="mt-4 max-w-3xl space-y-3 text-gray-600 leading-relaxed">
            <p>
              The playground above runs <code className="text-sm bg-gray-100 px-1 rounded">configureResolver({`{ mode: 'demo' }`})</code>{' '}
              against seeded fixtures shipped in{' '}
              <a href={NPM_PACKAGE} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                @canton-names/resolver@0.1.4
              </a>
              — no Canton credentials required.
            </p>
            <p>
              Source lives in{' '}
              <a href={GITHUB_REPO} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                kutaibah/name-hub
              </a>{' '}
              (<code className="text-sm">packages/resolver</code>). Contract behavior is covered by package tests (
              <code className="text-sm">resolve-contract.test.ts</code>) and app fixture tests; switch to live mode with
              one config change when you deploy.
            </p>
            <p>
              Need a full transfer mock?{' '}
              <Link href="/app/demo/recipient" className="text-indigo-600 font-medium hover:underline">
                Integration demo
              </Link>{' '}
              in the app shell.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function HowCard({ title, body }: { title: string; body: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{body}</p>
    </div>
  );
}
