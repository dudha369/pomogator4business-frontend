import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
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
              import('src/features/home/HomePage').then((m) => ({
                Component: m.HomePage,
              })),
          },
          {
            path: 'commands',
            lazy: () =>
              import('src/features/commands/CommandsPage').then((m) => ({
                Component: m.CommandsPage,
              })),
          },
          {
            path: 'archive',
            lazy: () =>
              import('src/features/archive/ArchivePage').then((m) => ({
                Component: m.ArchivePage,
              })),
          },
          {
            path: 'chats',
            lazy: () =>
              import('src/features/chats/ChatsPage').then((m) => ({
                Component: m.ChatsPage,
              })),
          },
          {
            path: 'settings',
            lazy: () =>
              import('src/features/settings/SettingsPage').then((m) => ({
                Component: m.SettingsPage,
              })),
          },
          {
            path: 'account',
            lazy: () =>
              import('src/features/account/AccountPage').then((m) => ({
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
