import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  variant?: 'dark' | 'light';
  className?: string;
}

const sizeClasses = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-9 w-9',
};

export function Logo({ size = 'md', showWordmark = false, variant = 'dark', className }: LogoProps) {
  const sizeClass = sizeClasses[size];
  
  if (showWordmark) {
    const wordmarkSrc = variant === 'light' ? '/logo-wordmark-light.svg' : '/logo-wordmark.svg';
    return (
      <Image
        src={wordmarkSrc}
        alt="Canton Names"
        width={176}
        height={40}
        className={cn('h-10 w-auto', className)}
        priority
      />
    );
  }
  
  return (
    <Image
      src="/logo.svg"
      alt="Canton Names"
      width={36}
      height={36}
      className={cn(sizeClass, 'rounded-lg', className)}
      priority
    />
  );
}

export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="cn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#cn-grad)" />
      <circle cx="10" cy="32" r="2" fill="white" />
      <circle cx="17" cy="32" r="2" fill="white" />
      <rect x="22" y="30" width="5" height="4" rx="1" fill="white" />
      <rect x="29" y="30" width="5" height="4" rx="1" fill="white" />
      <path d="M36 28 L42 32 L36 36 Z" fill="white" />
      <path d="M45 27 L57 27 Q59 27 59 29 L59 35 Q59 37 57 37 L45 37 L41 32 Z" fill="white" />
      <circle cx="53" cy="32" r="2.5" fill="url(#cn-grad)" />
    </svg>
  );
}
