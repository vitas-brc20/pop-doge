"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Leaderboard() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .order('count', { ascending: false });

      if (error) {
        console.error('Error fetching countries:', error);
      } else {
        setCountries(data);
      }
    };

    fetchCountries();

    // Realtime subscription
    const subscription = supabase
      .channel('country-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'countries' }, payload => {
        // When there's an update, refetch the countries to get the latest order
        fetchCountries();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="w-full max-w-md bg-white p-4 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Global Doge Leaderboard</h2>
      <ul>
        {countries.map((country) => (
          <li key={country.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span className="text-lg">{country.flag_emoji || country.id}</span>
            <span className="text-lg font-medium">{country.count.toLocaleString()} clicks</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
