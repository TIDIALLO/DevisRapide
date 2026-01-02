'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { SignatureCanvas } from '@/components/signature/signature-canvas';
import { Crown, Upload, Save, PenTool } from 'lucide-react';
import type { User } from '@/types';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const { showAlert, AlertDialog } = useAlertDialog();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [savingSignature, setSavingSignature] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
        if (data.signature_url) {
          setSignatureDataUrl(data.signature_url);
        }
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert('Le fichier est trop volumineux (max 2MB)', 'Fichier trop volumineux');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureSave = async (dataUrl: string) => {
    if (!profile) return;

    setSavingSignature(true);
    try {
      // Convertir data URL en blob avec le bon type MIME
      const response = await fetch(dataUrl);
      let blob = await response.blob();
      
      // S'assurer que le blob a le bon type MIME (image/png)
      // Parfois le fetch ne préserve pas le type MIME correctement
      if (!blob.type || blob.type !== 'image/png') {
        // Créer un nouveau blob avec le type MIME explicite
        blob = new Blob([blob], { type: 'image/png' });
      }

      // Upload vers Supabase Storage
      const fileName = `signature-${profile.id}-${Date.now()}.png`;
      
      // Note: On essaie directement l'upload sans vérifier l'existence du bucket
      // car listBuckets() peut échouer ou ne pas retourner le bucket même s'il existe
      // Si le bucket n'existe vraiment pas, l'upload échouera avec un message d'erreur clair

      // Upload du fichier avec le type MIME explicite
      // Note: Si le bucket a des restrictions de types MIME, s'assurer qu'image/png est autorisé
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, blob, { 
          upsert: true, 
          contentType: 'image/png',
          cacheControl: '3600',
          // Ne pas spécifier de metadata qui pourrait causer des problèmes
        });

      if (uploadError) {
        console.error('Erreur upload complète:', uploadError);
        
        // Messages d'erreur spécifiques selon le type d'erreur
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
          throw new Error(
            'Le bucket "logos" n\'existe pas. Veuillez le créer dans Supabase Dashboard → Storage.'
          );
        }
        
        if (uploadError.message?.includes('MIME type') || uploadError.message?.includes('content type') || uploadError.message?.includes('not allowed')) {
          throw new Error(
            'Le type de fichier n\'est pas autorisé. Veuillez vérifier que le bucket "logos" autorise le type "image/png" dans ses paramètres (Allowed MIME types).'
          );
        }
        
        if (uploadError.message?.includes('size') || uploadError.message?.includes('too large')) {
          throw new Error(
            'Le fichier est trop volumineux. La taille maximale autorisée est de 5 MB.'
          );
        }
        
        // Erreur générique avec le message original
        throw new Error(
          `Erreur lors de l'upload: ${uploadError.message || 'Erreur inconnue'}. Vérifiez que le bucket "logos" existe et que les types MIME sont correctement configurés.`
        );
      }

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(fileName);

      // Mettre à jour le profil avec l'URL de la signature
      const { error } = await supabase
        .from('users')
        .update({ signature_url: publicUrl })
        .eq('id', profile.id);

      if (error) throw error;

      setSignatureDataUrl(publicUrl);
      setShowSignatureDialog(false);
      
      // Message de succès plus élégant
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = '✅ Signature enregistrée avec succès !';
      document.body.appendChild(successMessage);
      setTimeout(() => {
        successMessage.remove();
      }, 3000);
      
      await loadProfile();
    } catch (error: any) {
      console.error('Erreur signature:', error);
      const errorMessage = error.message || 'Une erreur est survenue lors de l\'enregistrement de la signature.';
      
      // Message d'erreur plus élégant
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
      errorDiv.innerHTML = `❌ ${errorMessage}`;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    } finally {
      setSavingSignature(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      let logoUrl = profile.logo_url;

      // Upload logo si changé
      if (logoFile) {
        // Note: On essaie directement l'upload sans vérifier l'existence du bucket
        // car listBuckets() peut échouer même si le bucket existe (problème de permissions)
        // Si le bucket n'existe pas, l'upload échouera avec un message d'erreur clair
        
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('logos').getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      // Mettre à jour le profil
      const { error } = await supabase
        .from('users')
        .update({
          business_name: profile.business_name,
          address: profile.address,
          ninea: profile.ninea,
          default_payment_terms: profile.default_payment_terms,
          logo_url: logoUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;

      showAlert('Profil sauvegardé avec succès !', 'Succès');
      await loadProfile();
    } catch (error: any) {
      showAlert('Erreur: ' + error.message, 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  const isPro = profile.plan === 'pro';

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 lg:pb-6">
        <div>
          <h1 className="text-3xl font-bold">Mon profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations professionnelles</p>
        </div>

        {/* Plan Status */}
        <Card id="upgrade" className={isPro ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={isPro ? 'text-white' : ''}>
                  {isPro ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Plan PRO
                    </div>
                  ) : (
                    'Plan GRATUIT'
                  )}
                </CardTitle>
                <CardDescription className={isPro ? 'text-amber-100' : ''}>
                  {isPro
                    ? 'Accès illimité à toutes les fonctionnalités'
                    : '5 devis/mois • 20 articles • 10 clients max'}
                </CardDescription>
              </div>
              {!isPro && (
                <Link href="/upgrade">
                  <Button size="lg" variant="default">
                    Passer PRO - 4,900 FCFA/mois
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Ces informations sont liées à votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nom complet</Label>
              <Input value={profile.full_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={profile.phone} disabled />
            </div>
            <div className="space-y-2">
              <Label>Métier</Label>
              <Input value={profile.profession} disabled className="capitalize" />
            </div>
          </CardContent>
        </Card>

        {/* Informations professionnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations professionnelles</CardTitle>
            <CardDescription>Ces informations apparaîtront sur vos devis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nom de l'entreprise</Label>
              <Input
                id="business_name"
                value={profile.business_name || ''}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                placeholder="Ex: Peinture Moussa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ninea">Numéro NINEA (optionnel)</Label>
              <Input
                id="ninea"
                value={profile.ninea || ''}
                onChange={(e) => setProfile({ ...profile, ninea: e.target.value })}
                placeholder="Ex: 123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo de l'entreprise</Label>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-20 h-20 object-contain border rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <label
                    htmlFor="logo-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{logoPreview ? 'Changer le logo' : 'Uploader un logo'}</span>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 2MB • PNG, JPG</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Conditions de paiement par défaut</Label>
              <Textarea
                id="payment_terms"
                value={profile.default_payment_terms || ''}
                onChange={(e) => setProfile({ ...profile, default_payment_terms: e.target.value })}
                placeholder="Ex: Paiement à 30 jours. Acompte de 30% requis."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Signature</Label>
              <div className="flex items-center gap-4">
                {signatureDataUrl && (
                  <div className="border rounded-lg p-2 bg-white">
                    <img
                      src={signatureDataUrl}
                      alt="Signature"
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSignatureDialog(true)}
                  className="flex-1"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  {signatureDataUrl ? 'Modifier la signature' : 'Ajouter une signature'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Votre signature apparaîtra automatiquement sur tous vos devis
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog pour la signature */}
      <Dialog open={showSignatureDialog} onOpenChange={(open) => {
        if (!savingSignature) {
          setShowSignatureDialog(open);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Votre signature</DialogTitle>
            <DialogDescription className="text-base">
              Signez dans le cadre ci-dessous avec votre souris ou votre doigt. Votre signature apparaîtra automatiquement sur tous vos devis.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            {savingSignature && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-gray-600">Enregistrement en cours...</p>
                </div>
              </div>
            )}
            <SignatureCanvas
              onSave={handleSignatureSave}
              onCancel={() => {
                if (!savingSignature) {
                  setShowSignatureDialog(false);
                }
              }}
              currentSignature={signatureDataUrl}
            />
          </div>
        </DialogContent>
      </Dialog>
      {AlertDialog}
    </AppShell>
  );
}

