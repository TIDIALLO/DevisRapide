# 📝 TODO - Fonctionnalités à implémenter

## ✅ MVP Complété

Toutes les fonctionnalités du MVP sont implémentées :
- Authentification
- Profil entreprise
- Gestion clients
- Catalogue de produits
- Création de devis
- Dashboard
- Système freemium
- PWA configuration

## 🔨 Fonctionnalités à finaliser

### 1. Génération PDF téléchargeable (Priorité : HAUTE)

**Statut** : Structure créée, mais téléchargement non implémenté

**À faire** :
```typescript
// Dans app/(app)/devis/[id]/page.tsx

import { pdf } from '@react-pdf/renderer';
import { QuotePDF } from '@/lib/pdf/quote-pdf';

const handleDownloadPDF = async () => {
  const blob = await pdf(
    <QuotePDF quote={quote} profile={profile} />
  ).toBlob();
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${quote.quote_number}.pdf`;
  link.click();
};
```

**Fichiers à modifier** :
- `app/(app)/devis/[id]/page.tsx` : Ajouter le bouton de téléchargement
- Tester la génération PDF

### 2. Envoi Email (Priorité : MOYENNE)

**Statut** : Non implémenté

**À faire** :
1. Créer un compte sur [Resend](https://resend.com) (gratuit)
2. Installer : `npm install resend`
3. Créer une API route :

```typescript
// app/api/send-quote/route.ts

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, quotePdfUrl, quoteNumber } = await request.json();
  
  await resend.emails.send({
    from: 'DevisRapide <noreply@devisrapide.sn>',
    to: email,
    subject: `Votre devis ${quoteNumber}`,
    html: `<p>Bonjour,</p><p>Veuillez trouver ci-joint votre devis.</p>`,
    attachments: [
      {
        filename: `${quoteNumber}.pdf`,
        path: quotePdfUrl,
      },
    ],
  });

  return NextResponse.json({ success: true });
}
```

**Variables d'environnement** :
```env
RESEND_API_KEY=re_xxxxx
```

### 3. Envoi SMS (Priorité : BASSE)

**Statut** : Non implémenté

**Options** :
- [Twilio](https://www.twilio.com) - International
- [Orange SMS API](https://developer.orange.com) - Local Sénégal

**À faire** :
1. Choisir un fournisseur
2. Créer une API route
3. Ajouter un bouton "Envoyer SMS"

### 4. Paiement Wave/Orange Money (Priorité : HAUTE pour monétisation)

**Statut** : Non implémenté

**À faire** :
1. **Wave API**
   - Demander accès à l'API Wave
   - Documentation : [wave.com/developer](https://www.wave.com)
   
2. **Orange Money API**
   - Créer un compte marchand Orange Money
   - Intégrer l'API

3. **Créer la page de paiement** :

```typescript
// app/(app)/upgrade/page.tsx

export default function UpgradePage() {
  const handleWavePayment = async () => {
    // Appeler l'API Wave
    const response = await fetch('/api/payment/wave', {
      method: 'POST',
      body: JSON.stringify({
        amount: 5000,
        currency: 'XOF',
      }),
    });
    
    const { paymentUrl } = await response.json();
    window.location.href = paymentUrl;
  };

  return (
    <div>
      <h1>Passer PRO</h1>
      <button onClick={handleWavePayment}>
        Payer avec Wave
      </button>
    </div>
  );
}
```

4. **Webhook pour confirmer le paiement** :

```typescript
// app/api/webhooks/wave/route.ts

export async function POST(request: Request) {
  const payload = await request.json();
  
  // Vérifier la signature
  // Mettre à jour le plan de l'utilisateur
  await supabase
    .from('users')
    .update({
      plan: 'pro',
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    })
    .eq('id', payload.userId);

  return new Response('OK');
}
```

### 5. Mode Offline complet (Priorité : MOYENNE)

**Statut** : PWA configuré, mais pas de cache offline

**À faire** :
1. Implémenter Service Worker custom
2. Utiliser IndexedDB pour stocker :
   - Devis en brouillon
   - Catalogue
   - Clients
3. Synchroniser quand la connexion revient

**Fichiers à créer** :
- `public/sw.js` : Service Worker
- `lib/offline/sync.ts` : Logique de synchronisation

### 6. Modification de devis (Priorité : MOYENNE)

**Statut** : Non implémenté

**À faire** :
1. Créer la page `app/(app)/devis/[id]/modifier/page.tsx`
2. Réutiliser la logique de création
3. Pré-remplir avec les données existantes
4. Permettre la modification uniquement si statut = "draft"

### 7. Notifications (Priorité : BASSE)

**Statut** : Non implémenté

**Types de notifications** :
- Devis expirant dans 3 jours
- Rappel de paiement PRO
- Nouveau client ajouté

**À faire** :
1. Utiliser Supabase Edge Functions pour les crons
2. Envoyer des emails avec Resend
3. (Optionnel) Push notifications avec Firebase

### 8. Export Excel (Priorité : BASSE)

**Statut** : Non implémenté

**À faire** :
1. Installer : `npm install xlsx`
2. Créer une fonction d'export :

```typescript
import * as XLSX from 'xlsx';

const exportToExcel = (quotes: Quote[]) => {
  const data = quotes.map(q => ({
    'N° Devis': q.quote_number,
    'Client': q.client.full_name,
    'Date': q.date,
    'Montant': q.total,
    'Statut': q.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Devis');
  XLSX.writeFile(wb, 'devis-export.xlsx');
};
```

### 9. Templates PDF multiples (Priorité : BASSE)

**Statut** : Un seul template implémenté

**À faire** :
1. Créer 2-3 templates différents dans `lib/pdf/`
2. Ajouter un sélecteur de template dans le profil
3. Utiliser le template choisi lors de la génération

### 10. Statistiques avancées (Priorité : BASSE)

**Statut** : Dashboard basique implémenté

**À ajouter** :
- Graphique d'évolution sur 6 mois
- Top 5 clients
- Top 5 services vendus
- Comparaison mois par mois

**Librairie** : `recharts` (déjà installée)

## 🔧 Améliorations techniques

### Performance
- [ ] Implémenter le lazy loading des images
- [ ] Optimiser les requêtes Supabase (select uniquement les champs nécessaires)
- [ ] Ajouter du caching avec React Query

### Sécurité
- [ ] Ajouter rate limiting sur les API routes
- [ ] Implémenter la vérification d'email
- [ ] Ajouter 2FA (Two-Factor Authentication)

### UX/UI
- [ ] Ajouter des animations (Framer Motion)
- [ ] Améliorer les messages d'erreur
- [ ] Ajouter un tutoriel interactif pour les nouveaux utilisateurs
- [ ] Dark mode

### Tests
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration (Playwright)
- [ ] Tests E2E

## 📱 App Mobile Native (Phase 3)

**Statut** : Non planifié pour MVP

**Options** :
1. React Native avec Expo
2. Flutter
3. Capacitor (transformer la PWA en app native)

**Avantages** :
- Meilleure performance
- Accès aux fonctionnalités natives (caméra, contacts)
- Présence sur App Store / Play Store

## 🎯 Roadmap prioritaire

### Semaine 1-2 (Post-MVP)
1. ✅ Génération PDF téléchargeable
2. ✅ Paiement Wave/Orange Money
3. ✅ Envoi Email

### Mois 2
1. Modification de devis
2. Mode offline complet
3. Notifications basiques

### Mois 3
1. Export Excel
2. Templates PDF multiples
3. Statistiques avancées

### Mois 4-6
1. Conversion devis → facture
2. Suivi des paiements
3. Multi-utilisateurs (employés)

## 💡 Idées futures

- Intégration WhatsApp Business API (envoi automatique)
- Signature électronique des devis
- Gestion de stock basique
- Comptabilité simple
- Programme de parrainage
- Marketplace de templates
- API publique pour intégrations tierces

## 📝 Notes

- Toutes les fonctionnalités listées ici sont optionnelles pour le MVP
- Priorisez selon les feedbacks utilisateurs
- Lancez vite, itérez après
- Ne construisez que ce qui est demandé

---

**Dernière mise à jour** : 18 Décembre 2024

