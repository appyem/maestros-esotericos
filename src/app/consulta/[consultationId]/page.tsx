'use client';

import { getIdToken } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth';
import type { ClientConsultationDTO, ConsultationMessage } from '@/features/consultations/types';
import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export default function ConsultationRoomPage() {
  const params = useParams();
  const consultationId = params.consultationId as string;
  const { user, status } = useAuth();
  
  const [consultation, setConsultation] = useState<ClientConsultationDTO | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sequenceNumberRef = useRef(0);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 1. Cargar datos de la consulta
  useEffect(() => {
    async function fetchConsultation() {
      if (status !== 'authenticated' || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No hay usuario autenticado');
        const token = await getIdToken(currentUser);
        
        const res = await fetch(`/api/consultations/${consultationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('No se pudo cargar la consulta');
        const data = await res.json();
        setConsultation(data);
      } catch (err) {
        logger.error('Error cargando consulta', { err });
        setError('No se pudo cargar la información de la consulta.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchConsultation();
  }, [consultationId, status, user]);

  // 2. Suscripción en tiempo real a los mensajes
  useEffect(() => {
    if (!consultationId) return;

    const q = query(
      collection(db, 'consultationMessages'),
      orderBy('sequenceNumber', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ messageId: doc.id, ...doc.data() } as ConsultationMessage))
        .filter(msg => msg.consultationId === consultationId);
      
      setMessages(msgs);
      
      // Actualizar el número de secuencia local al más alto conocido
      if (msgs.length > 0) {
        sequenceNumberRef.current = Math.max(...msgs.map(m => m.sequenceNumber));
      }
    }, (err) => {
      logger.error('Error en suscripción de mensajes', { err });
    });

    return () => unsubscribe();
  }, [consultationId]);

  // 3. Enviar mensaje de forma segura
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !user) return;

    setIsSending(true);
    const contentToSend = newMessage.trim();
    setNewMessage(''); // Limpiar input inmediatamente para mejor UX

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No hay usuario autenticado');
      const token = await getIdToken(currentUser);

      sequenceNumberRef.current += 1;
      const currentSeq = sequenceNumberRef.current;

      const res = await fetch(`/api/consultations/${consultationId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          content: contentToSend,
          sequenceNumber: currentSeq,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al enviar');
      }

      logger.info('Mensaje enviado exitosamente');
    } catch (err) {
      logger.error('Error enviando mensaje', { err });
      setError('No se pudo enviar el mensaje. Inténtalo de nuevo.');
      setNewMessage(contentToSend); // Restaurar en caso de error
    } finally {
      setIsSending(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Preparando la sala de consulta...</p>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card padding="lg" className="w-full max-w-md text-center">
          <h1 className="text-2xl font-serif font-bold text-destructive mb-4">Error de acceso</h1>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-secondary/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-serif font-bold text-foreground">Sala de Consulta</h1>
            <p className="text-xs text-muted-foreground">ID: {consultation?.consultationId}</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {consultation?.status}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:flex-row lg:gap-6">
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <Card padding="md" className="bg-card/50">
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Detalles</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Maestro</p>
                  <p className="text-sm font-medium text-foreground">{consultation?.masterName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Especialidad</p>
                  <p className="text-sm font-medium text-foreground">{consultation?.specialty}</p>
                </div>
              </div>
            </Card>
            <Card padding="md" className="bg-card/50">
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Conexión</h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-foreground/80">En línea</span>
              </div>
            </Card>
          </aside>

          <section className="flex-1 flex flex-col min-h-0 bg-card/30 rounded-2xl border border-border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <span className="text-3xl text-primary">✦</span>
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-foreground mb-2">La consulta está lista</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Comienza la conversación. Tus mensajes están protegidos y solo el maestro asignado puede leerlos.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.messageId} className={`flex ${msg.senderType === 'CLIENT' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.senderType === 'CLIENT' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted text-muted-foreground rounded-bl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] opacity-70 mt-1 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-secondary/30">
              {error && <p className="text-xs text-destructive mb-2">{error}</p>}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Escribe tu mensaje al maestro..."
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  disabled={isSending || consultation?.status === 'COMPLETED'}
                />
                <Button 
                  variant="primary" 
                  size="sm" 
                  type="submit" 
                  disabled={isSending || !newMessage.trim() || consultation?.status === 'COMPLETED'}
                  isLoading={isSending}
                >
                  Enviar
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
