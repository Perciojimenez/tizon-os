#!/bin/bash
# Script para ver logs de Railway en tiempo real
# Filtra logs relevantes del flujo E2E

echo "🔍 Monitoreando logs de Railway..."
echo "Buscando: WhatsApp, WebSocket, Reservas"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Este script requiere Railway CLI instalado:"
echo "   npm install -g @railway/cli"
echo "   railway login"
echo "   railway link"
echo ""
echo "Comando manual:"
echo "   railway logs --service tizon-os | grep -E '(WhatsApp|WebSocket|Reserva|📱|🔄|📥)'"
echo ""
