import { PayPalButtons } from "@paypal/react-paypal-js";
import { supabase } from "@/lib/supabase"; // 설정된 supabase 클라이언트

interface Props {
  countryCode: string; // 현재 유저의 국가 코드 (예: 'KR')
}

export default function PaypalBoost({ countryCode }: Props) {
  return (
    <div className="flex flex-col items-center p-4 border rounded-xl bg-yellow-50">
      <h3 className="font-bold text-lg">⚡ 국가 부스트 (+$0.01)</h3>
      <p className="text-sm text-gray-600 mb-3">결제 시 {countryCode} 점수가 즉시 1,000점 상승합니다!</p>
      
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
            
            // 결제 성공 시 Supabase RPC 호출
            const { error } = await supabase.rpc('increment_country_score', {
              target_country_id: countryCode,
              amount: 1000
            });

            if (!error) {
              alert(`성공! ${countryCode}의 점수가 1,000점 올라갔습니다!`);
            }
          }
        }}
      />
    </div>
  );
}
