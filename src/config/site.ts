export const siteConfig = {
  name: 'Canton Names',
  description:
    'Readable names for Canton party IDs. Replace long, error-prone identifiers with simple names.',
  url: 'https://cantonnames.dev',
  links: {
    github: 'https://github.com/kutaibah/name-hub',
    docs: '/docs',
    app: '/app',
  },
  creator: 'Canton Names Team',
} as const;

export type SiteConfig = typeof siteConfig;

export function hasGitHubUrl(): boolean {
  return siteConfig.links.github.length > 0 && !siteConfig.links.github.includes('example');
}
