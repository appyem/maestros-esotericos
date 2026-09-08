import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-foreground text-center">Contacto</h1>
      <Card padding="lg">
        <form className="space-y-4">
          <Input label="Nombre o alias" required />
          <Input label="Correo electrónico" type="email" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Mensaje</label>
            <textarea className="w-full min-h-[120px] rounded-md border border-border bg-surface px-4 py-2.5 text-foreground focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-primary/20" required />
          </div>
          <Button type="submit" variant="primary" fullWidth>Enviar mensaje</Button>
        </form>
        <p className="mt-4 text-xs text-center text-foreground/50">
          Al enviar este formulario, aceptas nuestra Política de Privacidad.
        </p>
      </Card>
    </div>
  );
}
