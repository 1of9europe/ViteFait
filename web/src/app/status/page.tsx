'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { apiGet } from '@/lib/api';
import { env } from '@/lib/env';

interface ApiStatus {
  status: 'UP' | 'DOWN';
  message?: string;
  timestamp: string;
}

export default function StatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiGet('/health');
      setApiStatus({
        status: 'UP',
        message: response.message || 'API opérationnelle',
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setApiStatus({
        status: 'DOWN',
        message: 'Backend indisponible',
        timestamp: new Date().toISOString(),
      });
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Statut de l&apos;API
          </h1>
          <p className="text-muted-foreground">
            Vérification de la connectivité avec le backend
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium">API URL:</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {env.NEXT_PUBLIC_API_BASE_URL}
              </code>
            </div>

            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Vérification en cours...</span>
              </div>
            ) : apiStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm font-medium">Statut:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    apiStatus.status === 'UP' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {apiStatus.status}
                  </span>
                </div>

                {apiStatus.message && (
                  <p className="text-sm text-muted-foreground">
                    {apiStatus.message}
                  </p>
                )}

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">
                      Erreur: {error}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Dernière vérification: {new Date(apiStatus.timestamp).toLocaleString()}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={checkApiStatus} disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier à nouveau'}
            </Button>
            
            <Link href="/">
              <Button variant="outline">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 