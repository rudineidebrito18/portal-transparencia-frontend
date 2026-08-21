import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Config padrão do adapter — sem overrides de cache/incremental-cache por enquanto.
// Revisitar quando a Fase 4 do plano (ISR em massa) escolher onde guardar o cache do ISR
// (KV/R2), que se configura aqui.
export default defineCloudflareConfig()
