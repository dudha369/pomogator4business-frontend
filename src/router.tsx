import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { RouterErrorBoundary } from '@/shared/ui/loading/RouterErrorBoundary';
import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouterErrorBoundary />,
    hydrateFallbackElement: <LoadingScreen />,
    children: [
      {
        errorElement: <RouterErrorBoundary />,
        children: [
          {
            index: true,
            lazy: () =>
              import('@/features/home/HomePage').then((m) => ({
                Component: m.HomePage,
              })),
          },
          {
            path: 'commands',
            lazy: () =>
              import('@/features/commands/CommandsPage').then((m) => ({
                Component: m.CommandsPage,
              })),
          },
          {
            path: 'archive',
            lazy: () =>
              import('@/features/archive/ArchivePage').then((m) => ({
                Component: m.ArchivePage,
              })),
          },
          {
            path: 'chats',
            lazy: () =>
              import('@/features/chats/ChatsPage').then((m) => ({
                Component: m.ChatsPage,
              })),
          },
          {
            path: 'settings',
            lazy: () =>
              import('@/features/settings/SettingsPage').then((m) => ({
                Component: m.SettingsPage,
              })),
          },
          {
            path: 'alerts',
            lazy: () =>
              import('@/features/alerts/AlertsPage').then((m) => ({
                Component: m.AlertsPage,
              })),
          },
          {
            path: 'linkscan',
            lazy: () =>
              import('@/features/linkscan/LinkscanPage').then((m) => ({
                Component: m.LinkscanPage,
              })),
          },
          {
            path: 'userbot',
            lazy: () =>
              import('@/features/userbot/UserbotPage').then((m) => ({
                Component: m.UserbotPage,
              })),
          },
          {
            path: 'account',
            lazy: () =>
              import('@/features/account/AccountPage').then((m) => ({
                Component: m.AccountPage,
              })),
          },
          {
            path: '*',
            loader: () => {
              throw new Response('Not Found', { status: 404 });
            },
          },
        ],
      },
    ],
  },
]);
