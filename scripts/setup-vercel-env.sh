#!/bin/bash
# Script pour configurer les variables d'environnement Vercel
# Usage: bash scripts/setup-vercel-env.sh

echo "🔧 Configuration des variables d'environnement Vercel pour DevisRapide"
echo ""

# Lire les variables depuis .env.local si elles existent
if [ -f .env.local ]; then
    echo "📖 Lecture de .env.local..."
    
    # Extraire NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    
    # Extraire NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -z "$SUPABASE_KEY" ]; then
        SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    fi
    
    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
        echo "✅ Variables trouvées dans .env.local"
        echo ""
        echo "Ajout des variables d'environnement à Vercel..."
        
        # Ajouter NEXT_PUBLIC_SUPABASE_URL pour production, preview et development
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
        echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL development
        
        # Ajouter NEXT_PUBLIC_SUPABASE_ANON_KEY pour production, preview et development
        echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
        echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
        echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
        
        echo ""
        echo "✅ Variables d'environnement configurées avec succès !"
    else
        echo "❌ Variables manquantes dans .env.local"
        echo "Veuillez configurer manuellement avec: vercel env add"
    fi
else
    echo "❌ Fichier .env.local non trouvé"
    echo "Veuillez créer le fichier .env.local avec vos variables Supabase"
    echo "Puis exécutez: vercel env add NEXT_PUBLIC_SUPABASE_URL"
    echo "Et: vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

