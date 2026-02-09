import { PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/lib/supabase"; // 설정된 supabase 클라이언트

interface Props {
  countryCode: string; // 현재 유저의 국가 코드 (예: 'KR')
}

export default function PaypalBoost({ countryCode }: Props) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-xl bg-yellow-50">
      <h3 className="font-bold text-lg">⚡ Country Boost (+$0.01)</h3>
      <p className="text-sm text-gray-800 mb-3">Your purchase will instantly boost {countryCode}'s score by 1,000 points!</p>
      
      <PayPalButtons
        style={{ layout: "horizontal", height: 35 }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: "0.01", currency_code: "USD" },
              description: `${countryCode} 1000 Clicks Boost`
            }],
          });
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const details = await actions.order.capture();
            
            // On successful payment, call the Supabase RPC
            const { error } = await supabase.rpc('increment_country_score', {
              target_country_id: countryCode,
              amount: 1000
            });

            if (!error) {
              alert(`Success! ${countryCode}'s score has been boosted by 1,000 points!`);
            }
          }
        }}
      />
    </div>
  );
}
