export const siteConfig = {
  name: 'Canton Names',
  description:
    'Human-readable addresses for Canton Network. Replace complex party IDs with memorable names.',
  url: 'https://cantonnames.dev',
  links: {
    github: 'https://github.com/example/canton-names',
    docs: '/docs',
    app: '/app',
  },
  creator: 'Canton Names Team',
} as const;

export type SiteConfig = typeof siteConfig;
