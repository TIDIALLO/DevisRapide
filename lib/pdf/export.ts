import type { Client, Quote, QuoteItem, User } from '@/types';

type QuoteWithRelations = Quote & { client: Client; quote_items: QuoteItem[] };

export async function downloadQuotePdf(params: {
  quote: QuoteWithRelations;
  profile: User;
  filename: string;
  returnBlob?: boolean;
}): Promise<Blob | void> {
  if (typeof window === 'undefined') return;

  const [{ pdf }, { QuotePDF }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/lib/pdf/quote-pdf'),
  ]);

  // Pas de JSX ici (Turbopack parse les .ts sans JSX)
  const React = await import('react');
  const element = React.createElement(QuotePDF, {
    quote: params.quote,
    profile: params.profile,
  });
  // Type assertion pour résoudre l'incompatibilité de types avec @react-pdf/renderer
  // Le type de pdf() attend DocumentProps mais React.createElement retourne FunctionComponentElement
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - @react-pdf/renderer types are incompatible with React.createElement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(element as any).toBlob();

  // Si returnBlob est true, retourner le blob sans télécharger
  if (params.returnBlob) {
    return blob;
  }

  // Sinon, télécharger le fichier
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = params.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


