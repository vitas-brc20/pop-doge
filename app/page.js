"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabase';
import Leaderboard from '../components/Leaderboard';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaypalBoost from "../components/PaypalBoost";

export default function Home() {
  const [clicks, setClicks] = useState(0);
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('US');
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);
  const [dogeChannel, setDogeChannel] = useState(null);

  useEffect(() => {
    // 1. Wake up the Edge Function listener
    const wakeUpListener = async () => {
      console.log('Sending wake-up call to Edge Function listener...');
      const { error } = await supabase.functions.invoke('process-doge-clicks', { body: { action: 'wake-up' } });
      if (error) console.error('Error waking up listener:', error.message);
      else console.log('Listener wake-up call sent successfully.');
    };
    wakeUpListener();

    // 2. Read country code from cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const code = getCookie('country-code');
    if (code) setCountryCode(code);

    // 3. Setup Realtime Channel and wait for subscription
    const channel = supabase.channel('doge-clicks');
    channel.subscribe((status) => {
      console.log(`Realtime channel status: ${status}`);
      if (status === 'SUBSCRIBED') {
        setIsRealtimeReady(true);
      }
    });
    setDogeChannel(channel);

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleClick = async () => {
    setClicks(c => c + 1);
    setIsMouthOpen(true);
    setTimeout(() => setIsMouthOpen(false), 150);

    if (isRealtimeReady && dogeChannel) {
      dogeChannel.send({
        type: 'broadcast',
        event: 'click',
        payload: { country: countryCode, count: 1 },
      });
    } else {
      console.log('Realtime not ready yet, click not sent.');
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
        <h1 className="text-5xl font-bold mb-8 text-gray-800">Popdoge!</h1>
        <p className="text-2xl mb-8 text-gray-700">Clicks: {clicks}</p>
        <div
          onClick={handleClick}
          className={`cursor-pointer active:scale-95 transition-transform duration-75 ease-out ${!isRealtimeReady ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Image
            src={isMouthOpen ? "/open-doge.svg" : "/closed-doge.svg"}
            alt="Doge"
            width={200}
            height={200}
            priority
          />
        </div>
        {!isRealtimeReady && <p className="mt-4 text-sm text-gray-500">Connecting to Doge network...</p>}
        <div className="mt-8">
          <PaypalBoost countryCode={countryCode} />
        </div>
        <Leaderboard />
      </div>
    </PayPalScriptProvider>
  );
}