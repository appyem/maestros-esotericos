import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <span className="text-xl">✦</span>
              <span>Maestros Esotéricos</span>
            </div>
            <p className="text-sm text-foreground/60">
              Un espacio privado para encontrar orientación, comprensión y guía.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/servicios" className="text-foreground/60 hover:text-primary">
                  Servicios
                </Link>
              </li>
              <li>
                <Link href="/maestros" className="text-foreground/60 hover:text-primary">
                  Maestros
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-foreground/60 hover:text-primary">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-foreground/60 hover:text-primary">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidad" className="text-foreground/60 hover:text-primary">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-foreground/60 hover:text-primary">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-foreground/60 hover:text-primary">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Confianza */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Confianza</h3>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>Tu conversación es privada.</li>
              <li>Solo compartes lo que deseas.</li>
              <li>Información protegida.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-foreground/50">
          © {currentYear} Maestros Esotéricos. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
