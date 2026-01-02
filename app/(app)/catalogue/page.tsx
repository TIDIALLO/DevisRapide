'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Package, Copy } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import type { CatalogItem } from '@/types';

const UNITS = [
  { value: 'm²', label: 'm² (mètre carré)' },
  { value: 'heure', label: 'Heure' },
  { value: 'jour', label: 'Jour' },
  { value: 'pièce', label: 'Pièce' },
  { value: 'litre', label: 'Litre' },
  { value: 'sac', label: 'Sac' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'mètre', label: 'Mètre' },
  { value: 'm³', label: 'm³ (mètre cube)' },
  { value: 'forfait', label: 'Forfait' },
];

const CATEGORIES = ['Matériaux', 'Main d\'oeuvre', 'Équipement', 'Service', 'Frais', 'Autre'];

export default function CataloguePage() {
  const router = useRouter();
  const supabase = createClient();
  const { showAlert, showConfirm, AlertDialog } = useAlertDialog();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_price: '',
    unit: 'pièce',
    category: 'Matériaux',
  });

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/connexion');
        return;
      }

      const { data } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setItems(data);
      }
    } catch (error) {
      console.error('Erreur chargement catalogue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: CatalogItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        unit_price: item.unit_price.toString(),
        unit: item.unit,
        category: item.category || 'Matériaux',
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        unit_price: '',
        unit: 'pièce',
        category: 'Matériaux',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const itemData = {
        name: formData.name,
        description: formData.description || null,
        unit_price: parseFloat(formData.unit_price),
        unit: formData.unit,
        category: formData.category,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('catalog_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('catalog_items')
          .insert({
            ...itemData,
            user_id: user.id,
          });

        if (error) throw error;
      }

      setDialogOpen(false);
      await loadCatalog();
    } catch (error: any) {
      showAlert('Erreur: ' + error.message, 'Erreur');
    }
  };

  const handleDuplicate = async (item: CatalogItem) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('catalog_items')
        .insert({
          user_id: user.id,
          name: item.name + ' (copie)',
          description: item.description,
          unit_price: item.unit_price,
          unit: item.unit,
          category: item.category,
        });

      if (error) throw error;
      await loadCatalog();
    } catch (error: any) {
      showAlert('Erreur: ' + error.message, 'Erreur');
    }
  };

  const handleDelete = async (item: CatalogItem) => {
    showConfirm(
      `Supprimer "${item.name}" ?`,
      async () => {
        try {
          const { error } = await supabase
            .from('catalog_items')
            .delete()
            .eq('id', item.id);

          if (error) throw error;
          await loadCatalog();
        } catch (error: any) {
          showAlert('Erreur: ' + error.message, 'Erreur');
        }
      },
      'Supprimer l\'article',
      'destructive'
    );
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    'all',
    ...Array.from(
      new Set(
        items
          .map((i) => i.category)
          .filter((c): c is string => Boolean(c))
      )
    ),
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto pb-20 lg:pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Catalogue</h1>
            <p className="text-gray-600 mt-1">{items.length} article(s) dans votre catalogue</p>
          </div>
          <Button onClick={() => handleOpenDialog()} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel article
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="font-semibold text-gray-900 bg-white hover:bg-gray-50">
                Toutes catégories
              </SelectItem>
              {categories
                .filter((c) => c !== 'all')
                .map((category) => (
                  <SelectItem key={category} value={category} className="text-gray-900">
                    {category}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 truncate">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-medium text-primary">
                            {formatCurrency(item.unit_price)}/{item.unit}
                          </span>
                          {item.category && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(item)}
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(item)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Aucun article trouvé'
                  : 'Catalogue vide'}
              </p>
              <p className="mb-4">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Essayez une autre recherche'
                  : 'Ajoutez votre premier article pour commencer'}
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un article
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de l'article/service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'article *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Peinture mur intérieur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails optionnels..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Prix unitaire (FCFA) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="Ex: 2500"
                  min="0"
                  step="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unité *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.unit_price}
            >
              {editingItem ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {AlertDialog}
    </AppShell>
  );
}

