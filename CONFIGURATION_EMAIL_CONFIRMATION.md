# 📧 Configuration de la Confirmation Email

## ⚠️ Problème courant

Si les emails de confirmation ne sont pas envoyés ou si les liens expirent, voici comment corriger :

## ✅ Configuration dans Supabase Dashboard

### 1. Activer la confirmation email

1. Aller sur **Supabase Dashboard** → Votre projet
2. Cliquer sur **Authentication** (🔐) dans la barre latérale
3. Cliquer sur **Settings** (⚙️)
4. Dans la section **Email Auth**, activer **"Enable email confirmations"**
5. Cliquer sur **Save**

### 2. Configurer l'URL de redirection

1. Toujours dans **Authentication** → **Settings**
2. Scroller jusqu'à **"Site URL"**
3. Configurer l'URL de votre site :
   - **Développement local** : `http://localhost:3000`
   - **Production** : `https://votre-domaine.com`

4. Dans **"Redirect URLs"**, ajouter :
   - `http://localhost:3000/confirmation-email` (développement)
   - `https://votre-domaine.com/confirmation-email` (production)
   - `http://localhost:3000/**` (pour accepter toutes les routes en dev)
   - `https://votre-domaine.com/**` (pour accepter toutes les routes en prod)

### 3. Configurer les templates d'email (optionnel)

1. Dans **Authentication** → **Email Templates**
2. Personnaliser le template **"Confirm signup"** si nécessaire
3. Le template par défaut fonctionne, mais vous pouvez ajouter votre logo/branding

### 4. Vérifier la configuration SMTP (si emails ne partent pas)

Par défaut, Supabase utilise son service d'email. Si les emails ne partent pas :

1. Vérifier dans **Authentication** → **Settings** → **SMTP Settings**
2. Si vous avez un service SMTP (SendGrid, Mailgun, etc.), le configurer ici
3. Sinon, utiliser le service par défaut de Supabase (limité mais fonctionnel)

## 🔧 Vérifications dans le code

### URL de redirection dans l'inscription

Le code dans `app/(auth)/inscription/page.tsx` doit avoir :

```typescript
emailRedirectTo: typeof window !== 'undefined' 
  ? `${window.location.origin}/confirmation-email?email=${encodeURIComponent(formData.email)}`
  : undefined,
```

### Route de confirmation accessible

La route `/confirmation-email` doit être dans les routes publiques du middleware (`middleware.ts`).

## 🐛 Dépannage

### Les emails ne sont pas envoyés

1. **Vérifier que la confirmation est activée** dans Supabase Dashboard
2. **Vérifier les logs** dans Supabase Dashboard → Logs → Auth
3. **Vérifier le dossier spam** de l'utilisateur
4. **Tester avec un autre email** (Gmail, Outlook, etc.)

### Le lien expire immédiatement

1. **Vérifier la durée de validité** dans Supabase Dashboard → Authentication → Settings
2. Par défaut, les liens expirent après 24 heures
3. Si besoin, augmenter la durée dans les paramètres

### Erreur "otp_expired" ou "access_denied"

1. Le lien a expiré → L'utilisateur peut demander un nouvel email depuis `/confirmation-email`
2. Le lien a été utilisé deux fois → Un lien ne peut être utilisé qu'une seule fois
3. L'URL de redirection ne correspond pas → Vérifier la configuration dans Supabase

### L'utilisateur ne reçoit pas l'email

1. **Vérifier le dossier spam/courrier indésirable**
2. **Vérifier que l'email est correct** (pas de faute de frappe)
3. **Vérifier les logs Supabase** pour voir si l'email a été envoyé
4. **Utiliser un service SMTP externe** si le service par défaut ne fonctionne pas

## 📝 Script SQL pour tester

Si vous voulez tester sans attendre l'email, vous pouvez confirmer manuellement un email :

```sql
-- Confirmer un email spécifique (remplacer l'email)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'test@example.com';
```

## ✅ Checklist de configuration

- [ ] Confirmation email activée dans Supabase Dashboard
- [ ] Site URL configurée correctement
- [ ] Redirect URLs ajoutées (avec `/confirmation-email`)
- [ ] URL de redirection dans le code correspond à la config Supabase
- [ ] Route `/confirmation-email` accessible (dans middleware)
- [ ] Test d'envoi d'email réussi
- [ ] Test de clic sur le lien de confirmation réussi

## 🎯 Résultat attendu

Après configuration :
1. L'utilisateur s'inscrit → Email automatiquement envoyé
2. L'utilisateur clique sur le lien → Redirigé vers `/confirmation-email`
3. L'email est confirmé → Redirection vers `/dashboard`
4. Si le lien expire → L'utilisateur peut demander un nouvel email

