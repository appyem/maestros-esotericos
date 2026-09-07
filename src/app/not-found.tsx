import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotFound() {
  return (
    <EmptyState
      title="Página no encontrada"
      description="La página que buscas no existe o ha sido movida."
      icon={
        <svg
          className="h-16 w-16"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
      action={
        <Link href="/">
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      }
    />
  );
}
