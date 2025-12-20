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
  const blob = await pdf(element).toBlob();

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


