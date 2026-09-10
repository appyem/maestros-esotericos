import { Suspense } from 'react';

import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-3xl space-y-4">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Orientación Inicial
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Comienza tu conversación con nuestra guía inteligente. Cuando estés listo, 
            podrás transferir el contexto de esta charla directamente a un maestro experto.
          </p>
        </div>
        
        {/* Suspense boundary requerido por Next.js para useSearchParams */}
        <Suspense fallback={
          <div className="flex h-[600px] w-full items-center justify-center bg-card border border-border rounded-xl shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Preparando tu guía...</p>
            </div>
          </div>
        }>
          <ChatWindow />
        </Suspense>
      </div>
    </main>
  );
}
