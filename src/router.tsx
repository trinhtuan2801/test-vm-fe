import { createBrowserRouter } from 'react-router';
import App from './App.tsx';
import About from './routes/About.tsx';
import Home from './routes/Home.tsx';
import NotFound from './routes/NotFound.tsx';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App,
      children: [
        { index: true, Component: Home },
        { path: 'about', Component: About },
        { path: '*', Component: NotFound },
      ],
    },
  ],
  {
    basename: '/test-vm-fe',
  },
);
