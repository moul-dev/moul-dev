// Registers every <moul-*> element from the component library.
import '@moul-dev/web-component';
import './index.css';
import './icons';
import './components/layout/app-layout';
import './app';
import { router } from './lib/router';
import { routes } from './routes';

router.start(routes);

// The Moul Inspector is a development aid; `vite build` drops this branch and its chunk.
if (import.meta.env.DEV) void import('./devtools/inspector');
