import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('POPDOGE_URL')!,
  Deno.env.get('POPDOGE_SERVICE_ROLE_KEY')! // Use service role key for direct DB access
);

const CLICK_DEBOUNCE_MS = 2000; // 2 seconds
const clickBuffer = new Map<string, number>(); // Map<countryId, clickCount>
let debounceTimer: number | null = null;

// Function to process and update the database
const processClicks = async () => {
  if (clickBuffer.size === 0) {
    debounceTimer = null;
    return;
  }

  const updates = Array.from(clickBuffer.entries()).map(([countryId, count]) => ({
    id: countryId,
    count: count,
  }));
  clickBuffer.clear(); // Clear buffer after preparing updates

  console.log('Processing clicks:', updates);

  for (const update of updates) {
    const { error } = await supabase.rpc('increment_country_clicks', {
      country_id: update.id,
      increment_by: update.count,
    });
    if (error) {
      console.error('Error incrementing country clicks via RPC:', error);
    }
  }

  debounceTimer = null;
};

// Listen for broadcast messages
supabase
  .channel('doge-clicks')
  .on('broadcast', { event: 'click' }, (payload) => {
    const { country, count } = payload.payload;
    
    if (country) {
      clickBuffer.set(country, (clickBuffer.get(country) || 0) + count);
      
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(processClicks, CLICK_DEBOUNCE_MS);
    }
  })
  .subscribe();

// Deno server to keep the Edge Function alive
serve(async (_req) => {
  return new Response(JSON.stringify({ status: 'listening' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
