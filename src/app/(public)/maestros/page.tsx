import { Suspense } from 'react';

import { Loading } from '@/components/ui/Loading';

import MaestrosClient from './MaestrosClient';

export default function MaestrosPage() {
  return (
    <Suspense fallback={<Loading fullScreen message="Cargando maestros..." />}>
      <MaestrosClient />
    </Suspense>
  );
}