import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

console.log("Edge Function script started.");

try {
  const popdogeUrl = Deno.env.get('POPDOGE_URL');
  const serviceKey = Deno.env.get('POPDOGE_SERVICE_ROLE_KEY');

  if (!popdogeUrl || !serviceKey) {
    throw new Error("Missing required environment variables: POPDOGE_URL or POPDOGE_SERVICE_ROLE_KEY");
  }
  console.log("Environment variables loaded successfully.");

  const supabase = createClient(popdogeUrl, serviceKey);
  console.log("Supabase client initialized.");

  const CLICK_DEBOUNCE_MS = 2000;
  const clickBuffer = new Map<string, number>();
  let debounceTimer: number | null = null;

  const processClicks = async () => {
    if (clickBuffer.size === 0) {
      debounceTimer = null;
      return;
    }
    const updates = Array.from(clickBuffer.entries()).map(([countryId, count]) => ({
      id: countryId,
      count: count,
    }));
    clickBuffer.clear();
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

  const channel = supabase.channel('doge-clicks');
  console.log("Subscribing to 'doge-clicks' channel...");
  
  channel.on('broadcast', { event: 'click' }, (payload) => {
    console.log("Received a click broadcast!", payload);
    const { country, count } = payload.payload;
    
    if (country) {
      clickBuffer.set(country, (clickBuffer.get(country) || 0) + count);
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(processClicks, CLICK_DEBOUNCE_MS);
    }
  }).subscribe((status) => {
    console.log(`Channel subscription status: ${status}`);
  });

  console.log("Subscription setup complete.");

  serve(async (req) => {
  // This is needed to invoke the function from a browser.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // We don't need to do anything with the request body for the wake-up call,
    // but this is how you would handle it if you needed to.
    const body = await req.json();
    console.log(`Function invoked with body:`, body);
    
    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

} catch (e) {
  console.error("Critical error on startup:", e.message);
}