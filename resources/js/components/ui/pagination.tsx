import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import React from 'react';

interface PaginationProps {
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  className?: string;
}

export function Pagination({ links, className = '' }: PaginationProps) {
  // No mostrar paginación si no hay links o hay muy pocos
  if (!links || links.length <= 3) return null;

  // Encontrar los enlaces "Previous" y "Next"
  const prevLink = links.find(link => link.label === "&laquo; Previous");
  const nextLink = links.find(link => link.label === "Next &raquo;");

  // Filtrar los enlaces numéricos (excluyendo "Previous" y "Next")
  const pageLinks = links.filter(
    link => link.label !== "&laquo; Previous" && link.label !== "Next &raquo;"
  );

  // Función para limpiar el HTML en las etiquetas
  const cleanLabel = (label: string) => {
    // Si es un número o una elipsis simple, devuélvelo directamente
    if (!isNaN(Number(label)) || label === "...") return label;
    
    // Para etiquetas con HTML como "&laquo; Previous" o "Next &raquo;"
    if (label.includes("&laquo;")) return "«";
    if (label.includes("&raquo;")) return "»";
    if (label.includes("...")) return "...";
    
    return label;
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {/* Previous Page Button */}
      <Button
        variant="ghost"
        className="h-9 w-9 p-0 mr-1"
        asChild={prevLink?.url !== null}
        disabled={prevLink?.url === null}
      >
        {prevLink?.url ? (
          <Link href={prevLink.url} preserveScroll preserveState only={['zonals', 'filters']}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageLinks.map((link, i) => {
          // Para elipsis
          if (link.label.includes('...')) {
            return (
              <Button
                key={i}
                variant="ghost"
                className="h-9 w-9 p-0"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            );
          }

          return (
            <Button
              key={i}
              variant={link.active ? "default" : "ghost"}
              className="h-9 w-9 p-0"
              asChild={link.url !== null}
              disabled={link.url === null}
            >
              {link.url ? (
                <Link href={link.url} preserveScroll preserveState only={['zonals', 'filters']}>
                  {cleanLabel(link.label)}
                </Link>
              ) : (
                <span>{cleanLabel(link.label)}</span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <Button
        variant="ghost"
        className="h-9 w-9 p-0 ml-1"
        asChild={nextLink?.url !== null}
        disabled={nextLink?.url === null}
      >
        {nextLink?.url ? (
          <Link href={nextLink.url} preserveScroll preserveState only={['zonals', 'filters']}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
