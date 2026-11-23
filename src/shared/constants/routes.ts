export const ROUTES = {
  home: '/',
  commands: '/commands',
  archive: '/archive',
  chats: '/chats',
  settings: '/settings',
  account: '/account',
  alerts: '/alerts',
  linkscan: '/linkscan',
  userbot: '/userbot',
} as const;

export const ROOT_PATHS: readonly string[] = [
  ROUTES.home,
  ROUTES.commands,
  ROUTES.archive,
  ROUTES.account,
];
