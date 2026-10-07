'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CopySnippet({
  value,
  label,
  className = '',
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-900 px-3 py-2.5 font-mono text-sm text-slate-100 ${className}`}
    >
      <code className="flex-1 overflow-x-auto whitespace-nowrap pr-10">{value}</code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute right-1 top-1/2 h-8 -translate-y-1/2 text-slate-300 hover:bg-slate-800 hover:text-white"
        aria-label={label ?? 'Copy to clipboard'}
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export function CodeBlock({
  code,
  title,
}: {
  code: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-gray-700 bg-slate-800 px-4 py-2">
          <span className="text-xs font-medium text-slate-400">{title}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 text-slate-300 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="mr-1 h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
      <pre className="overflow-x-auto bg-slate-900 p-4 text-sm text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
