// Script pour mettre à jour la base de données avec les colonnes Stripe
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabase() {
  console.log('🚀 Mise à jour de la base de données...\n');

  try {
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../lib/supabase/UPDATE_PAYMENTS_SUBSCRIPTIONS.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL à exécuter:');
    console.log('─'.repeat(50));
    console.log(sql);
    console.log('─'.repeat(50));
    console.log('\n⚠️  ATTENTION: Ce script ne peut pas exécuter le SQL directement.');
    console.log('📋 Le SQL a été copié ci-dessus. Veuillez:');
    console.log('   1. Ouvrir https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql');
    console.log('   2. Copier-coller le SQL ci-dessus');
    console.log('   3. Cliquer sur "Run"\n');

    // Vérifier si la table payments existe
    const { data: tables, error } = await supabase
      .from('payments')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('❌ La table "payments" n\'existe pas encore!');
      console.log('   Veuillez d\'abord exécuter: lib/supabase/CREATE_PAYMENTS_TABLE.sql\n');
      process.exit(1);
    }

    console.log('✅ La table "payments" existe\n');

    // Instructions pour l'utilisateur
    console.log('📝 INSTRUCTIONS:');
    console.log('   1. Copiez tout le SQL ci-dessus (entre les lignes ─)');
    console.log('   2. Allez sur: https://supabase.com/dashboard/project/mtborwdznqasahyageej/sql');
    console.log('   3. Collez le SQL dans l\'éditeur');
    console.log('   4. Cliquez sur "Run" (ou Ctrl+Enter)');
    console.log('   5. Vérifiez qu\'il n\'y a pas d\'erreurs\n');

    console.log('✨ Une fois le SQL exécuté, vous pourrez tester l\'intégration Stripe!\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

updateDatabase();
