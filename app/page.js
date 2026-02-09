"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react"; // Add useRef
import { supabase } from '../lib/supabase';
import Leaderboard from '../components/Leaderboard';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import PaypalBoost from "../components/PaypalBoost";
import KcpBoost from "../components/KcpBoost";

export default function Home() {
  const [clicks, setClicks] = useState(0); // Visual click counter for the user
  const [isMouthOpen, setIsMouthOpen] = useState(false);
  const [countryCode, setCountryCode] = useState('US');

  // Refs for client-side debouncing
  const clickBuffer = useRef(0);
  const debounceTimer = useRef(null);

  // This function sends the collected clicks to the database
  const sendClickBatch = async () => {
    if (clickBuffer.current === 0) return;

    const clicksToSend = clickBuffer.current;
    clickBuffer.current = 0; // Reset buffer immediately

    console.log(`Sending batch of ${clicksToSend} clicks for ${countryCode}`);

    const { error } = await supabase.rpc('increment_country_clicks', {
      country_id: countryCode,
      increment_by: clicksToSend,
    });

    if (error) {
      console.error('Error sending click batch:', error);
      // If error, add clicks back to buffer to retry next time
      clickBuffer.current += clicksToSend;
    }
  };

  useEffect(() => {
    // Read country code from cookie on mount
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const code = getCookie('country-code');
    if (code) setCountryCode(code);

    // Add an event listener to send any remaining clicks when the user leaves the page
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendClickBatch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Send any final clicks when the component unmounts
      sendClickBatch();
    };
  }, [countryCode]); // Re-run if countryCode changes (though it shouldn't often)

  const handleClick = () => {
    // 1. Update visual counter for immediate feedback
    setClicks(c => c + 1);
    setIsMouthOpen(true);
    setTimeout(() => setIsMouthOpen(false), 150);

    // 2. Add to our buffer
    clickBuffer.current += 1;

    // 3. Reset the timer to send the batch
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(sendClickBatch, 2000); // Send after 2 seconds of inactivity
  };

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
        <h1 className="text-5xl font-bold mb-8 text-gray-800">Popdoge!</h1>
        <p className="text-2xl mb-8 text-gray-700">Clicks: {clicks}</p>
        <div
          onClick={handleClick}
          className="w-full max-w-md cursor-pointer active:scale-95 transition-transform duration-75 ease-out"
        >
          <Image
            src={isMouthOpen ? "/opened.png" : "/closed.png"}
            alt="Doge"
            width={500}
            height={500}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="mt-8 w-full max-w-md">
          {countryCode === 'KR' ? (
            <KcpBoost />
          ) : (
            <PaypalBoost countryCode={countryCode} />
          )}
        </div>
        <Leaderboard />
      </div>
    </PayPalScriptProvider>
  );
}