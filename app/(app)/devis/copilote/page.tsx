'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Plus, Trash2, FileDown } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { parseToLineItems } from '@/lib/copilot/parser';
import { useSpeechRecognition } from '@/components/copilot/use-speech-recognition';
import { downloadQuotePdf } from '@/lib/pdf/export';
import { SupabaseSetupCard } from '@/components/setup/supabase-setup-card';
import type { Client, Quote, QuoteItem, User } from '@/types';

type DraftItem = {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

function calcAmount(item: DraftItem) {
  return Number(item.quantity) * Number(item.unit_price);
}

export default function CopiloteDevisPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const [command, setCommand] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);

  const quoteDate = useMemo(() => new Date(), []);
  const validUntil = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }, []);

  const speech = useSpeechRecognition({ lang: 'fr-FR' });

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const load = async () => {
    // IMPORTANT: on fige la valeur pour que TypeScript puisse la "narrow"
    // correctement (sinon `supabase` est vu comme potentiellement changeant).
    const sb = supabase;
    if (!sb) return;
    try {
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        router.push('/connexion');
        return;
      }

      const { data: p } = await sb.from('users').select('*').eq('id', user.id).single();
      if (p) setProfile(p);

      const { data: c } = await sb
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (c) setClients(c);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Injecter la dictée dans la commande (preview temps réel)
    const combined = [speech.finalText, speech.interimText].filter(Boolean).join('\n');
    if (!combined) return;
    setCommand(combined);
  }, [speech.finalText, speech.interimText]);

  const subtotal = items.reduce((sum, it) => sum + calcAmount(it), 0);

  const resolvedClient = useMemo(() => {
    const selected = clients.find((c) => c.id === selectedClientId);
    if (selected) return selected;
    // fallback manuel (si pas de client)
    const now = new Date().toISOString();
    return {
      id: 'draft-client',
      user_id: profile?.id ?? 'draft-user',
      full_name: clientName || 'Client',
      phone: clientPhone || '',
      email: null,
      address: null,
      notes: null,
      created_at: now,
      updated_at: now,
    } satisfies Client;
  }, [clients, selectedClientId, clientName, clientPhone, profile?.id]);

  const addFromCommand = () => {
    const parsed = parseToLineItems(command);
    const newItems: DraftItem[] = parsed.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name,
      description: p.description,
      quantity: p.quantity,
      unit: p.unit,
      unit_price: p.unit_price,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setCommand('');
    speech.reset();
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const exportPdf = async () => {
    if (!profile) return;
    const now = new Date().toISOString();

    const quote_items: QuoteItem[] = items.map((it, idx) => ({
      id: `draft-item-${idx}`,
      quote_id: 'draft-quote',
      name: it.name,
      description: it.description ?? null,
      quantity: it.quantity,
      unit: it.unit,
      unit_price: it.unit_price,
      amount: calcAmount(it),
      order: idx,
      created_at: now,
    }));

    const quote: Quote & { client: Client; quote_items: QuoteItem[] } = {
      id: 'draft-quote',
      user_id: profile.id,
      client_id: resolvedClient.id,
      document_type: 'devis',
      service_description: null,
      quote_number: `DEV-DRAFT`,
      status: 'draft',
      date: quoteDate.toISOString().slice(0, 10),
      valid_until: validUntil.toISOString().slice(0, 10),
      subtotal,
      discount_type: null,
      discount_value: null,
      discount_amount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total: subtotal,
      payment_terms: profile.default_payment_terms,
      notes: null,
      pdf_url: null,
      sent_at: null,
      created_at: now,
      updated_at: now,
      client: resolvedClient,
      quote_items,
    };

    await downloadQuotePdf({
      quote,
      profile,
      filename: `DEV-DRAFT.pdf`,
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppShell>
    );
  }

  // Si Supabase n'est pas configuré (ou URL invalide dans `.env.local`),
  // on guide vers la page de setup au lieu de crasher.
  if (!configured) {
    return <SupabaseSetupCard />;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl pb-20 lg:pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Copilote Devis</h1>
            <p className="text-muted-foreground">
              Dictez ou écrivez. L&apos;aperçu se met à jour et vous pouvez exporter en PDF.
            </p>
          </div>

          <Button onClick={exportPdf} disabled={!profile || items.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: assistant */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Assistant de chiffrage</span>
                <div className="flex items-center gap-2">
                  {speech.supported ? (
                    <Button
                      variant={speech.listening ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => (speech.listening ? speech.stop() : speech.start())}
                    >
                      {speech.listening ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Dicter
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Vocal non supporté</span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              {/* Client */}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Client (optionnel)</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.full_name} — {c.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ou saisir manuellement</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nom client"
                      disabled={Boolean(selectedClientId)}
                    />
                    <Input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Téléphone"
                      disabled={Boolean(selectedClientId)}
                    />
                  </div>
                </div>
              </div>

              {/* Command */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Commande vocale ou texte</Label>
                  {speech.supported && (
                    <div className="flex items-center gap-2">
                      {speech.listening ? (
                        <span className="flex items-center gap-1 text-xs text-red-600 animate-pulse">
                          <Mic className="w-3 h-3" />
                          En écoute...
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Cliquez sur "Dicter" pour parler</span>
                      )}
                    </div>
                  )}
                </div>
                <Textarea
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={`Exemples de commandes vocales ou texte:\n\n"Peinture mur 20 mètres carrés à 2500"\n"Déplacement forfait à 10000"\n"Main d'oeuvre 3 heures à 8000"\n\nVous pouvez dicter ou taper plusieurs lignes.`}
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={addFromCommand} disabled={!command.trim()} className="flex-1 sm:flex-none">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter au devis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCommand('');
                      speech.reset();
                    }}
                    disabled={!command.trim() && !speech.finalText}
                  >
                    Effacer
                  </Button>
                </div>
                {speech.listening && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs text-green-800 font-medium flex items-center gap-2">
                      <Mic className="w-4 h-4 animate-pulse" />
                      Écoute active — Parlez maintenant. Exemple : "Peinture mur 20 m2 à 2500"
                    </p>
                  </div>
                )}
                {speech.finalText && !speech.listening && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <p className="text-xs text-blue-800">
                      ✓ Texte dicté détecté. Cliquez sur "Ajouter au devis" pour l'ajouter.
                    </p>
                  </div>
                )}
              </div>

              {/* Items quick edit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Lignes ({items.length})</Label>
                  <div className="text-sm font-semibold text-primary">{formatCurrency(subtotal)}</div>
                </div>

                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                      Aucune ligne. Dicte ou écris une commande puis clique “Ajouter au devis”.
                    </div>
                  ) : (
                    items.map((it) => (
                      <div
                        key={it.id}
                        className="group relative rounded-xl border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{it.name}</div>
                            {it.description && (
                              <div className="text-xs text-muted-foreground">{it.description}</div>
                            )}
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              <Input
                                type="number"
                                value={it.quantity}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((x) =>
                                      x.id === it.id ? { ...x, quantity: Number(e.target.value) } : x
                                    )
                                  )
                                }
                                min="0"
                                step="0.01"
                              />
                              <Input
                                value={it.unit}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((x) => (x.id === it.id ? { ...x, unit: e.target.value } : x))
                                  )
                                }
                              />
                              <Input
                                type="number"
                                value={it.unit_price}
                                onChange={(e) =>
                                  setItems((prev) =>
                                    prev.map((x) =>
                                      x.id === it.id ? { ...x, unit_price: Number(e.target.value) } : x
                                    )
                                  )
                                }
                                min="0"
                                step="1"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm font-semibold">{formatCurrency(calcAmount(it))}</div>
                            <Button variant="ghost" size="sm" onClick={() => removeItem(it.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: preview */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between">
                <span>Aperçu du devis</span>
                <span className="text-xs text-muted-foreground">Mise à jour automatique</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">VOTRE ENTREPRISE</div>
                  <div className="text-xl font-semibold tracking-tight">
                    {profile?.business_name || profile?.full_name || 'Votre entreprise'}
                  </div>
                  {!profile?.business_name && (
                    <div className="text-sm text-muted-foreground">
                      Configurez vos informations dans <span className="font-medium">Profil</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">DEVIS N°</div>
                  <div className="text-lg font-semibold">DEV-DRAFT</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="text-xs text-muted-foreground">CLIENT</div>
                  <div className="mt-1 font-medium">{resolvedClient.full_name}</div>
                  <div className="text-sm text-muted-foreground">{resolvedClient.phone || '—'}</div>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {quoteDate.toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="text-muted-foreground">Valable jusqu&apos;au</span>
                    <span className="font-medium">{validUntil.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border">
                <div className="grid grid-cols-5 bg-muted/40 px-4 py-3 text-xs font-semibold">
                  <div className="col-span-2">Description</div>
                  <div className="text-center">Qté</div>
                  <div className="text-center">Unité</div>
                  <div className="text-right">Montant</div>
                </div>

                {items.length === 0 ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">
                    Commencez à dicter votre devis. Les lignes apparaîtront ici.
                  </div>
                ) : (
                  <div>
                    {items.map((it, idx) => (
                      <div
                        key={it.id}
                        className={`grid grid-cols-5 px-4 py-3 text-sm ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                      >
                        <div className="col-span-2 font-medium">{it.name}</div>
                        <div className="text-center">{it.quantity}</div>
                        <div className="text-center">{it.unit}</div>
                        <div className="text-right font-semibold">{formatCurrency(calcAmount(it))}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg">
                    <span className="font-semibold">TOTAL</span>
                    <span className="font-bold text-primary">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}




