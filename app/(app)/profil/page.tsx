'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SignatureCanvas } from '@/components/signature/signature-canvas';
import { Crown, Upload, Save, PenTool } from 'lucide-react';
import type { User } from '@/types';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

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
        alert('Le fichier est trop volumineux (max 2MB)');
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

    try {
      // Convertir data URL en blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Upload vers Supabase Storage
      const fileName = `signature-${profile.id}-${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, blob, { upsert: true, contentType: 'image/png' });

      if (uploadError) throw uploadError;

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
      alert('Signature enregistrée avec succès !');
      await loadProfile();
    } catch (error: any) {
      alert('Erreur lors de l\'enregistrement de la signature: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      let logoUrl = profile.logo_url;

      // Upload logo si changé
      if (logoFile) {
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

      alert('Profil sauvegardé avec succès !');
      await loadProfile();
    } catch (error: any) {
      alert('Erreur: ' + error.message);
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
                <Button size="lg" variant="default">
                  Passer PRO - 5,000 FCFA/mois
                </Button>
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
      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter votre signature</DialogTitle>
            <DialogDescription>
              Signez dans le cadre ci-dessous avec votre souris ou votre doigt. Votre signature apparaîtra sur tous vos devis.
            </DialogDescription>
          </DialogHeader>
          <SignatureCanvas
            onSave={handleSignatureSave}
            onCancel={() => setShowSignatureDialog(false)}
            currentSignature={signatureDataUrl}
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

