export const SITE_TITLE = 'arumaのブログ';
export const SITE_DESCRIPTION = 'arumaのブログです';

export const AUTHOR = {
  name: 'aruma256',
  avatar: '/assets/images/aruma_white_square.png',
  bio: 'Webエンジニア。VR、競プロ、謎解きなど。',
  links: [
    { label: 'X', icon: 'x', url: 'https://x.com/aruma256' },
    { label: 'GitHub', icon: 'github', url: 'https://github.com/aruma256' },
  ],
} as const;

export const NAV = [
  { title: 'Profile', url: '/profile' },
  { title: 'Tags', url: '/tags' },
  { title: 'Posts', url: '/posts' },
] as const;

export const GA_MEASUREMENT_ID = 'G-Q0KBBGX3BJ';
