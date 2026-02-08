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
  const [countryCode, setCountryCode] = useState('US'); // Default country code

  useEffect(() => {
    // Read country code from cookie set by middleware
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };
    const code = getCookie('country-code');
    if (code) {
      setCountryCode(code);
    }
  }, []);

  const handleClick = async () => {
    setClicks(clicks + 1);
    setIsMouthOpen(true);
    setTimeout(() => {
      setIsMouthOpen(false);
    }, 150);

    const { error } = await supabase.channel('doge-clicks')
      .send({
        type: 'broadcast',
        event: 'click',
        payload: { country: countryCode, count: 1 }, // Use dynamic country code
      });

    if (error) {
      console.error('Error sending broadcast:', error);
    }
  };

  return (
    <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
        <h1 className="text-5xl font-bold mb-8 text-gray-800">Popdoge!</h1>
        <p className="text-2xl mb-8 text-gray-700">Clicks: {clicks}</p>
        <div
          onClick={handleClick}
          className="cursor-pointer active:scale-95 transition-transform duration-75 ease-out"
        >
          <Image
            src={isMouthOpen ? "/open-doge.svg" : "/closed-doge.svg"}
            alt="Doge"
            width={200}
            height={200}
            priority
          />
        </div>
        <div className="mt-8">
            <PaypalBoost countryCode={countryCode} />
        </div>
        <Leaderboard />
      </div>
    </PayPalScriptProvider>
  );
}