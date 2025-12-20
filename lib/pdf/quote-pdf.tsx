import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Quote, Client, QuoteItem, User } from '@/types';

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 80,
    height: 80,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
  },
  companyInfo: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  clientInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoColumn: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    borderBottom: '2 solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'center' },
  col4: { flex: 1.5, textAlign: 'right' },
  col5: { flex: 1.5, textAlign: 'right' },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 8,
    color: '#6b7280',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    fontSize: 10,
  },
  totalRowDiscount: {
    color: '#dc2626',
  },
  totalRowFinal: {
    borderTop: '2 solid #d1d5db',
    paddingTop: 10,
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
  },
  footerTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footerText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.5,
  },
  watermark: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  signatureSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: 200,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 10,
  },
  signatureImage: {
    width: 150,
    height: 60,
    objectFit: 'contain',
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
          {/* Logo placeholder - @react-pdf/renderer ne supporte pas facilement les images externes */}
        </View>

        {/* Client & Quote Info */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.sectionTitle}>Devis pour:</Text>
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
              <Text>{quote.quote_number}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text>{formatDate(quote.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valable jusqu'au:</Text>
              <Text>{formatDate(quote.valid_until)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Qté</Text>
            <Text style={styles.col3}>Unité</Text>
            <Text style={styles.col4}>Prix Unit.</Text>
            <Text style={styles.col5}>Montant</Text>
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
              <Text>Sous-total:</Text>
              <Text>{formatCurrency(Number(quote.subtotal))}</Text>
            </View>

            {quote.discount_amount > 0 && (
              <View style={[styles.totalRow, styles.totalRowDiscount]}>
                <Text>
                  Remise{' '}
                  {quote.discount_type === 'percent'
                    ? `(${quote.discount_value}%)`
                    : ''}
                  :
                </Text>
                <Text>- {formatCurrency(Number(quote.discount_amount))}</Text>
              </View>
            )}

            {quote.tax_amount > 0 && (
              <View style={styles.totalRow}>
                <Text>TVA ({quote.tax_rate}%):</Text>
                <Text>+ {formatCurrency(Number(quote.tax_amount))}</Text>
              </View>
            )}

            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text>TOTAL TTC:</Text>
              <Text>{formatCurrency(Number(quote.total))}</Text>
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

        {/* Signature */}
        {profile.signature_url && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature</Text>
              <Image
                src={profile.signature_url}
                style={styles.signatureImage}
              />
              <Text style={[styles.footerText, { marginTop: 5, fontSize: 8 }]}>
                {profile.full_name || profile.business_name}
              </Text>
            </View>
          </View>
        )}

        {/* Watermark for free plan */}
        {!isPro && (
          <View style={styles.watermark}>
            <Text>Généré avec DevisRapide - www.devisrapide.sn</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

