// Client API Bictorys
import type {
  CreateChargeRequest,
  CreateChargeResponse,
  BictorysError,
} from './types';

const BICTORYS_API_BASE_URL =
  process.env.BICTORYS_ENVIRONMENT === 'production'
    ? 'https://api.bictorys.com'
    : 'https://api.test.bictorys.com';

function getApiKey(): string {
  const key = process.env.BICTORYS_API_KEY_PUBLIC;
  if (!key) {
    console.error('[Bictorys] Variables d\'environnement disponibles:', {
      BICTORYS_ENVIRONMENT: process.env.BICTORYS_ENVIRONMENT,
      hasKey: !!process.env.BICTORYS_API_KEY_PUBLIC,
      nodeEnv: process.env.NODE_ENV,
    });
    throw new Error('BICTORYS_API_KEY_PUBLIC is not set in environment variables. Please check your .env.local file and restart the server.');
  }
  
  // Nettoyer la clé (supprimer les espaces, retours à la ligne, etc.)
  const cleanKey = key.trim();
  
  if (!cleanKey || cleanKey.length < 10) {
    throw new Error('BICTORYS_API_KEY_PUBLIC appears to be invalid (too short). Please check your .env.local file.');
  }
  
  return cleanKey;
}

/**
 * Crée une charge de paiement via l'API Bictorys
 * @param request - Paramètres de la charge
 * @returns Réponse avec l'URL de checkout
 */
/**
 * Convertit le type de paiement interne en format Bictorys
 */
function mapPaymentTypeToBictorys(paymentType?: string): string | undefined {
  if (!paymentType) return undefined;
  
  // Mapping selon la documentation Bictorys
  // IMPORTANT: Bictorys attend "wave_money" et non "wave"
  const mapping: Record<string, string> = {
    'orange_money': 'orange_money',
    'wave': 'wave_money', // Bictorys attend "wave_money"
    'card': 'card',
    'Orange Money': 'orange_money',
    'Wave': 'wave_money', // Bictorys attend "wave_money"
  };
  
  return mapping[paymentType] || paymentType;
}

export async function createCharge(
  request: CreateChargeRequest
): Promise<CreateChargeResponse> {
  // Mapper le type de paiement si nécessaire
  const bictorysPaymentType = mapPaymentTypeToBictorys(request.payment_type);
  
  const url = `${BICTORYS_API_BASE_URL}/pay/v1/charges${
    bictorysPaymentType ? `?payment_type=${encodeURIComponent(bictorysPaymentType)}` : ''
  }`;

  const apiKey = getApiKey();
  
  console.log('[Bictorys] Création charge:', {
    url,
    amount: request.amount,
    currency: request.currency,
    payment_type: bictorysPaymentType,
    apiKeyPrefix: apiKey.substring(0, 20) + '...', // Log partiel pour sécurité
    hasApiKey: !!apiKey,
  });

  const requestBody: any = {
    amount: request.amount,
    currency: request.currency,
    country: request.country,
    successRedirectUrl: request.successRedirectUrl,
    errorRedirectUrl: request.errorRedirectUrl,
    metadata: request.metadata || {},
  };

  // Ajouter operator et phone si fournis (pour mobile money direct)
  if (request.operator) {
    requestBody.operator = request.operator;
  }
  if (request.phone) {
    requestBody.phone = request.phone;
  }

  console.log('[Bictorys] Requête complète:', {
    method: 'POST',
    url,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey.substring(0, 30) + '...', // IMPORTANT: Bictorys attend "X-API-Key" (majuscules)
      'Accept': 'application/json',
    },
    body: requestBody,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey, // IMPORTANT: Bictorys attend "X-API-Key" (majuscules)
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // Vérifier le Content-Type avant de parser JSON
  const contentType = response.headers.get('content-type');
  let data: any;

  // Lire la réponse (JSON ou texte)
  let responseText = '';
  try {
    responseText = await response.text();
  } catch (e) {
    console.error('Erreur lecture réponse:', e);
    throw new Error('Impossible de lire la réponse de l\'API Bictorys');
  }

  // Logs détaillés pour diagnostic
  console.log('[Bictorys] Réponse reçue:', {
    status: response.status,
    statusText: response.statusText,
    contentType,
    headers: Object.fromEntries(response.headers.entries()),
    responseLength: responseText.length,
    responsePreview: responseText.substring(0, 200),
  });

  // Parser JSON si possible
  if (contentType && contentType.includes('application/json')) {
    try {
      data = JSON.parse(responseText);
      console.log('[Bictorys] Données JSON parsées:', data);
    } catch (e) {
      console.error('Erreur parsing JSON:', e);
      console.error('Réponse brute complète:', responseText);
      throw new Error('Réponse JSON invalide de l\'API Bictorys');
    }
  } else {
    // Si ce n'est pas du JSON, logger la réponse complète
    console.error('[Bictorys] Réponse non-JSON complète:', responseText);
    
    // Pour une erreur 403, c'est généralement un problème d'authentification
    if (response.status === 403) {
      // Essayer de parser comme JSON même si le Content-Type n'est pas JSON
      try {
        const jsonData = JSON.parse(responseText);
        const errorMsg = jsonData?.error?.message || jsonData?.message || 'Clé API invalide ou non autorisée';
        console.error('[Bictorys] Erreur 403 détaillée:', jsonData);
        throw new Error(`Erreur 403: ${errorMsg}. Vérifiez que votre clé API est correcte et active dans le dashboard Bictorys.`);
      } catch (parseError) {
        // Si ce n'est pas du JSON, utiliser le message générique
        throw new Error('Erreur 403: Clé API invalide ou non autorisée. Vérifiez que votre clé API est correcte et active dans le dashboard Bictorys. Réponse serveur: ' + responseText.substring(0, 200));
      }
    }
    
    throw new Error(`Erreur Bictorys: Réponse invalide (${response.status} ${response.statusText}). Réponse: ${responseText.substring(0, 200)}`);
  }

  if (!response.ok) {
    const error = data as BictorysError;
    const errorMessage = error?.error?.message || error?.message || error?.details || `Erreur Bictorys: ${response.statusText}`;
    console.error('[Bictorys] Erreur détaillée:', {
      status: response.status,
      statusText: response.statusText,
      error: errorMessage,
      fullData: data,
      responseText: responseText,
    });
    
    // Message spécifique pour 403 avec détails
    if (response.status === 403) {
      const detailedMessage = errorMessage || 'Clé API invalide ou non autorisée';
      throw new Error(`Erreur 403: ${detailedMessage}. Vérifiez votre clé API dans le dashboard Bictorys et redémarrez le serveur.`);
    }
    
    throw new Error(errorMessage);
  }

  return data as CreateChargeResponse;
}

/**
 * Récupère les détails d'une charge
 * @param chargeId - ID de la charge
 * @returns Détails de la charge
 */
export async function getCharge(
  chargeId: string
): Promise<CreateChargeResponse> {
  const url = `${BICTORYS_API_BASE_URL}/pay/v1/charges/${chargeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': getApiKey(), // IMPORTANT: Bictorys attend "X-API-Key" (majuscules)
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as BictorysError;
    throw new Error(
      error.error?.message || `Erreur Bictorys: ${response.statusText}`
    );
  }

  return data as CreateChargeResponse;
}

/**
 * Convertit un montant FCFA en centimes (pour Bictorys)
 * @param amountFCFA - Montant en FCFA
 * @returns Montant en centimes
 */
export function convertToCentimes(amountFCFA: number): number {
  // Bictorys utilise les centimes : 100 FCFA = 10000 centimes
  return Math.round(amountFCFA * 100);
}

/**
 * Convertit un montant en centimes en FCFA
 * @param centimes - Montant en centimes
 * @returns Montant en FCFA
 */
export function convertFromCentimes(centimes: number): number {
  return centimes / 100;
}
