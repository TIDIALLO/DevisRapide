import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Quote, Client, QuoteItem, User } from '@/types';

// Styles pour le PDF - Design ultra professionnel inspiré de factures modernes
const styles = StyleSheet.create({
  page: {
    padding: 28,
    paddingTop: 18,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#faf9f7', // Couleur beige professionnelle uniforme
  },
  // Header ultra compact avec logo et texte remontés en haut
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1 solid #d4c5b8', // Bordure beige professionnelle
    marginTop: 0,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerRight: {
    alignItems: 'flex-end',
    minWidth: 160,
    paddingLeft: 8,
  },
  logoContainer: {
    width: 50,
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flexShrink: 0,
    marginTop: 2, // Rapproché de FACTURE
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  companyInfoContainer: {
    marginTop: 0,
    paddingTop: 0,
  },
  documentTypeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    letterSpacing: 1.5,
    marginBottom: 2, // Réduit pour rapprocher le logo
    marginTop: 0,
    textAlign: 'right',
  },
  serviceDescription: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 4, // Réduit pour rapprocher le logo
    lineHeight: 1.3,
    fontStyle: 'italic',
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 0,
    color: '#1a1a1a',
    lineHeight: 1.3,
  },
  companyInfo: {
    fontSize: 8,
    color: '#4b5563',
    marginBottom: 2.5,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientInfo: {
    fontSize: 9,
    marginBottom: 3,
    color: '#374151',
    lineHeight: 1.4,
  },
  clientName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingTop: 10,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
    lineHeight: 1.4,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 6,
    color: '#374151',
    minWidth: 70,
    fontSize: 9,
  },
  infoValue: {
    color: '#1a1a1a',
    fontSize: 9,
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 8,
    borderBottom: '2 solid #e5e7eb',
    borderTop: '1 solid #e5e7eb',
  },
  tableHeaderText: {
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #f3f4f6',
  },
  tableRowAlt: {
    backgroundColor: '#fafbfc',
  },
  col1: { flex: 3, paddingRight: 6 },
  col2: { flex: 0.8, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'center' },
  col4: { flex: 1.5, textAlign: 'right', fontSize: 8, paddingRight: 4 },
  col5: { flex: 1.5, textAlign: 'right', fontSize: 8, fontWeight: 'bold' },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1a1a1a',
    fontSize: 9,
  },
  itemDescription: {
    fontSize: 7,
    color: '#6b7280',
    lineHeight: 1.3,
    marginTop: 1,
  },
  totalsSection: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: 250,
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    fontSize: 9,
    color: '#374151',
  },
  totalRowLabel: {
    fontWeight: 'normal',
  },
  totalRowValue: {
    fontWeight: 'normal',
    color: '#1a1a1a',
  },
  totalRowDiscount: {
    color: '#dc2626',
  },
  totalRowFinal: {
    borderTop: '2 solid #e5e7eb',
    paddingTop: 8,
    marginTop: 5,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalRowFinalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalRowFinalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  footer: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: '1 solid #d4c5b8', // Bordure beige professionnelle
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 8,
    color: '#4b5563',
    lineHeight: 1.5,
    marginBottom: 3,
  },
  watermark: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 7,
    color: '#a8a29e', // Couleur beige pour le watermark
    fontStyle: 'italic',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 9,
    color: '#6b7280',
  },
  signatureSection: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 160,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  signatureImage: {
    width: 120,
    height: 45,
    objectFit: 'contain',
    borderBottom: '1 solid #d1d5db',
    paddingBottom: 4,
  },
  signatureName: {
    fontSize: 7,
    color: '#4b5563',
    marginTop: 4,
    textAlign: 'right',
  },
});

interface QuotePDFProps {
  quote: Quote & { client: Client; quote_items: QuoteItem[] };
  profile: User;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ quote, profile }) => {
  const formatCurrency = (amount: number) => {
    // Format avec point comme séparateur de milliers (ex: 6.000 FCFA)
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace(/\s/g, '.') + ' FCFA';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const isPro = profile.plan === 'pro';

  // Fonction pour vérifier et normaliser l'URL du logo/signature
  // Améliorée pour garantir un rendu professionnel à l'impression
  const getValidLogoUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    // Nettoyer l'URL (supprimer les espaces, etc.)
    let cleanUrl = url.trim();
    if (!cleanUrl) return null;
    
    try {
      // Si l'URL est relative (commence par /), c'est une URL Supabase
      // @react-pdf/renderer peut avoir des problèmes avec les URLs relatives
      // On doit s'assurer que c'est une URL absolue pour l'impression
      if (cleanUrl.startsWith('/')) {
        // URL relative Supabase - on la retourne telle quelle
        // @react-pdf/renderer devrait la gérer, mais si ça ne marche pas,
        // il faudra convertir en URL absolue côté serveur
        return cleanUrl;
      }
      
      // Vérifier que c'est une URL valide (absolue)
      const urlObj = new URL(cleanUrl);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        // URL absolue valide - parfaite pour l'impression
        // S'assurer qu'il n'y a pas de paramètres de cache qui pourraient causer des problèmes
        // On garde l'URL telle quelle pour @react-pdf/renderer
        return cleanUrl;
      }
    } catch (error) {
      // Si l'URL n'est pas valide, retourner null
      console.warn('[PDF] URL invalide pour logo/signature:', cleanUrl, error);
      return null;
    }
    
    return null;
  };

  const logoUrl = getValidLogoUrl(profile.logo_url);
  const signatureUrl = getValidLogoUrl(profile.signature_url);

  // Debug: Log pour vérifier les URLs (utile pour le debug)
  // Ces logs apparaîtront dans la console du navigateur lors de la génération du PDF
  console.log('[PDF Debug] Logo URL validée:', logoUrl);
  console.log('[PDF Debug] Signature URL validée:', signatureUrl);
  console.log('[PDF Debug] Profile logo_url brut:', profile.logo_url);
  console.log('[PDF Debug] Profile signature_url brut:', profile.signature_url);
  console.log('[PDF Debug] Profile complet:', {
    id: profile.id,
    has_logo_url: !!profile.logo_url,
    has_signature_url: !!profile.signature_url,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header : Informations entreprise à gauche, Logo + Titre à droite (style Anthropic) */}
        <View style={styles.header}>
          {/* Partie gauche : Informations entreprise */}
          <View style={styles.headerLeft}>
            <View style={styles.companyInfoContainer}>
              <Text style={styles.companyName}>
                {profile.business_name || profile.full_name}
              </Text>
              {profile.address && (
                <Text style={styles.companyInfo}>{profile.address}</Text>
              )}
              {profile.phone && (
                <Text style={styles.companyInfo}>Tél: {profile.phone}</Text>
              )}
              {profile.email && (
                <Text style={styles.companyInfo}>Email: {profile.email}</Text>
              )}
              {profile.ninea && (
                <Text style={styles.companyInfo}>NINEA: {profile.ninea}</Text>
              )}
            </View>
          </View>
          
          {/* Partie droite : Type de document en haut, puis logo (style ultra professionnel) */}
          <View style={styles.headerRight}>
            {/* Type de document en premier (remonté en haut) */}
            <Text style={styles.documentTypeTitle}>
              {quote.document_type === 'facture' ? 'FACTURE' : 'DEVIS'}
            </Text>
            {quote.service_description && (
              <Text style={styles.serviceDescription}>
                {quote.service_description}
              </Text>
            )}
            {/* Logo juste en dessous */}
            {logoUrl && (
              <View style={styles.logoContainer}>
                <Image
                  src={logoUrl}
                  style={styles.logoImage}
                  cache={false}
                />
              </View>
            )}
          </View>
        </View>

        {/* Client & Quote Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>
              {quote.document_type === 'facture' ? 'Facturé à:' : 'Devis pour:'}
            </Text>
            <Text style={styles.clientName}>{quote.client.full_name}</Text>
            <Text style={styles.clientInfo}>{quote.client.phone}</Text>
            {quote.client.email && (
              <Text style={styles.clientInfo}>{quote.client.email}</Text>
            )}
            {quote.client.address && (
              <Text style={styles.clientInfo}>{quote.client.address}</Text>
            )}
          </View>

          <View style={[styles.infoColumn, { alignItems: 'flex-end' }]}>
            <Text style={styles.sectionTitle}>Informations:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>N°:</Text>
              <Text style={styles.infoValue}>{quote.quote_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date d'émission:</Text>
              <Text style={styles.infoValue}>{formatDate(quote.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {quote.document_type === 'facture' ? "Date d'échéance:" : "Valable jusqu'au:"}
              </Text>
              <Text style={styles.infoValue}>{formatDate(quote.valid_until)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col1, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.col2, styles.tableHeaderText]}>Qté</Text>
            <Text style={[styles.col3, styles.tableHeaderText]}>Unité</Text>
            <Text style={[styles.col4, styles.tableHeaderText]}>Prix Unit.</Text>
            <Text style={[styles.col5, styles.tableHeaderText]}>Montant</Text>
          </View>

          {quote.quote_items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, index % 2 === 0 ? styles.tableRowAlt : {}]}
            >
              <View style={styles.col1}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.unit}</Text>
              <Text style={styles.col4}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.col5}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Sous-total:</Text>
              <Text style={styles.totalRowValue}>{formatCurrency(Number(quote.subtotal))}</Text>
            </View>

            {quote.discount_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalRowLabel, styles.totalRowDiscount]}>
                  Remise{' '}
                  {quote.discount_type === 'percent'
                    ? `(${quote.discount_value}%)`
                    : ''}
                  :
                </Text>
                <Text style={[styles.totalRowValue, styles.totalRowDiscount]}>
                  - {formatCurrency(Number(quote.discount_amount))}
                </Text>
              </View>
            )}

            {quote.tax_amount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>TVA ({quote.tax_rate}%):</Text>
                <Text style={styles.totalRowValue}>+ {formatCurrency(Number(quote.tax_amount))}</Text>
              </View>
            )}

            <View style={styles.totalRowFinal}>
              <Text style={styles.totalRowFinalLabel}>TOTAL TTC:</Text>
              <Text style={styles.totalRowFinalValue}>{formatCurrency(Number(quote.total))}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {quote.payment_terms && (
            <View style={styles.section}>
              <Text style={styles.footerTitle}>Conditions de paiement:</Text>
              <Text style={styles.footerText}>{quote.payment_terms}</Text>
            </View>
          )}

          {quote.notes && (
            <View style={styles.section}>
              <Text style={styles.footerTitle}>Notes:</Text>
              <Text style={styles.footerText}>{quote.notes}</Text>
            </View>
          )}
        </View>

        {/* Signature en bas à droite */}
        {signatureUrl && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature</Text>
              <Image
                src={signatureUrl}
                style={styles.signatureImage}
                cache={false}
              />
              <Text style={styles.signatureName}>
                {profile.full_name || profile.business_name}
              </Text>
            </View>
          </View>
        )}

        {/* Watermark for free plan */}
        {!isPro && (
          <View style={styles.watermark}>
            <Text>Généré avec DevisRapide - www.devisrapide.com</Text>
          </View>
        )}

        {/* Page number (style Anthropic) */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} sur ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

