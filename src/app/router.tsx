import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import NotFound from './NotFound';
import CommandCentre from '@/features/command-centre/CommandCentre';
import Worklist from '@/features/worklist/Worklist';
import Directory from '@/features/patients/Directory';
import Patient360 from '@/features/patient-360/Patient360';
import DoctorsDay from '@/features/doctor/DoctorsDay';
import PatientApp from '@/features/patient-app/PatientApp';
import CryoRegister from '@/features/cryo/CryoRegister';
import Analytics from '@/features/analytics/Analytics';
import Integrations from '@/features/integrations/Integrations';
import FollowUpRules from '@/features/rules/FollowUpRules';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <CommandCentre /> },
      { path: '/worklist', element: <Worklist /> },
      { path: '/patients', element: <Directory /> },
      { path: '/patients/:id', element: <Patient360 /> },
      { path: '/doctor', element: <DoctorsDay /> },
      { path: '/patient-app', element: <PatientApp /> },
      { path: '/cryo', element: <CryoRegister /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/integrations', element: <Integrations /> },
      { path: '/rules', element: <FollowUpRules /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
