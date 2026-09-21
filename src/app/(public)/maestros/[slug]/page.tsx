import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { getPublicMasterProfile } from '@/features/masters';

export default async function MaestroPublicoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const master = await getPublicMasterProfile(slug);

  if (!master) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card padding="lg" className="bg-card">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-48 h-48 rounded-full bg-secondary flex items-center justify-center text-4xl text-foreground/30 overflow-hidden relative">
              {master.profileImageUrl ? (
                <Image src={master.profileImageUrl} alt={master.displayName} fill className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-bold">
                  {master.displayName.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{master.displayName}</h1>
            <p className="text-lg text-primary font-medium mb-4">{master.professionalTitle}</p>
            <p className="text-foreground/80 mb-6 leading-relaxed">{master.shortDescription}</p>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {master.specialties.map(spec => (
                <span key={spec} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {spec.replace('_', ' ')}
                </span>
              ))}
            </div>

            <Link href={`/maestros/${master.publicSlug}/reservar`}>
              <button className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm">
                Ver disponibilidad y reservar
              </button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}