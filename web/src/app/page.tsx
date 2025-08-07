import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            ViteFait - Conciergerie Urbaine
          </h1>
          <p className="text-xl text-muted-foreground">
            Plateforme de services de conciergerie urbaine
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm font-medium">Environnement:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
              {env.NEXT_PUBLIC_APP_ENV}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            API: {env.NEXT_PUBLIC_API_BASE_URL}
          </div>
        </div>

        <div className="space-y-4">
          <Link href="/status">
            <Button size="lg">
              Vérifier le statut de l&apos;API
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground">
            Vérifiez la connectivité avec le backend
          </p>
        </div>
      </div>
    </div>
  );
}
