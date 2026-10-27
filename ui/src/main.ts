// Registers every <moul-*> element from the component library.
import '@moul-dev/ui';
import './index.css';
import './icons';
import './components/layout/app-layout';
import './app';
import { router } from './lib/router';
import { routes } from './routes';

router.start(routes);
