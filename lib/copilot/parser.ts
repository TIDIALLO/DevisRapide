export type ParsedLineItem = {
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

const UNIT_ALIASES: Array<{ re: RegExp; unit: string }> = [
  { re: /^m2$/i, unit: 'm²' },
  { re: /^m²$/i, unit: 'm²' },
  { re: /^m3$/i, unit: 'm³' },
  { re: /^m³$/i, unit: 'm³' },
  { re: /^(h|heure|heures)$/i, unit: 'heure' },
  { re: /^(j|jour|jours)$/i, unit: 'jour' },
  { re: /^(piece|pièce|pcs?)$/i, unit: 'pièce' },
  { re: /^(l|litre|litres)$/i, unit: 'litre' },
  { re: /^(kg|kilo|kilos)$/i, unit: 'kg' },
  { re: /^(m|metre|mètre|metres|mètres)$/i, unit: 'mètre' },
  { re: /^(sac|sacs)$/i, unit: 'sac' },
  { re: /^(forfait)$/i, unit: 'forfait' },
];

function normalizeNumber(raw: string): number {
  const n = raw.trim().replace(/\s/g, '').replace(',', '.');
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeUnit(raw: string): string {
  const trimmed = raw.trim();
  for (const a of UNIT_ALIASES) {
    if (a.re.test(trimmed)) return a.unit;
  }
  return trimmed || 'forfait';
}

/**
 * Parse une commande texte (tapée/dictée) en lignes de devis.
 *
 * Exemples acceptés:
 * - "Peinture mur 20 m2 à 2500"
 * - "Main d'oeuvre 3 heures a 8000"
 * - "Déplacement forfait à 10000"
 *
 * Si on ne comprend pas: fallback -> 1 ligne (forfait) avec prix 0 (à compléter).
 */
export function parseToLineItems(text: string): ParsedLineItem[] {
  const cleaned = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const items: ParsedLineItem[] = [];

  for (const line of cleaned) {
    // Pattern: "<nom> <qty> <unit> à <prix>"
    const p1 =
      /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*([a-zA-ZÀ-ÿ0-9²³]+)\s*(?:à|a|@)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:fcfa|xof))?$/i;
    const m1 = line.match(p1);
    if (m1) {
      items.push({
        name: m1[1]!.trim(),
        quantity: normalizeNumber(m1[2]!),
        unit: normalizeUnit(m1[3]!),
        unit_price: normalizeNumber(m1[4]!),
      });
      continue;
    }

    // Pattern: "<qty> <unit> <nom> à <prix>"
    const p2 =
      /^(\d+(?:[.,]\d+)?)\s*([a-zA-ZÀ-ÿ0-9²³]+)\s+(.+?)\s*(?:à|a|@)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:fcfa|xof))?$/i;
    const m2 = line.match(p2);
    if (m2) {
      items.push({
        name: m2[3]!.trim(),
        quantity: normalizeNumber(m2[1]!),
        unit: normalizeUnit(m2[2]!),
        unit_price: normalizeNumber(m2[4]!),
      });
      continue;
    }

    // Pattern minimal: "<nom> à <prix>" (forfait)
    const p3 =
      /^(.+?)\s*(?:à|a|@)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:fcfa|xof))?$/i;
    const m3 = line.match(p3);
    if (m3) {
      items.push({
        name: m3[1]!.trim(),
        quantity: 1,
        unit: 'forfait',
        unit_price: normalizeNumber(m3[2]!),
      });
      continue;
    }

    // Fallback: on garde le texte comme nom
    items.push({
      name: line,
      quantity: 1,
      unit: 'forfait',
      unit_price: 0,
      description: 'À compléter (prix non détecté)',
    });
  }

  return items;
}


