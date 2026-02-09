"use client";

import { useEffect } from 'react';

// This lets TypeScript know that NCPPay will be available on the window object
declare global {
  interface Window {
    NCPPay: any;
  }
}

export default function KcpBoost() {
  const siteCode = 'GKU38'; // Provided by user
  const orderAmount = 100; // 100 KRW

  const handlePayment = () => {
    if (typeof window.NCPPay === 'undefined') {
      alert('KCP 결제 모듈을 로드하지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    // This needs to be a publicly accessible URL where the user is redirected after payment.
    // We will need to create this page later.
    const confirmUrl = `${window.location.origin}/payment/kcp/confirm`;

    window.NCPPay.setConfiguration({
      'clientId': siteCode,
      'confirmUrl': confirmUrl,
      'platform': 'WEB',
    });

    const orderData = {
      orderSheetNo: `POPDOGE-${new Date().getTime()}`, // Unique order number
      orderName: 'Popdoge 1,000 Points Boost',
      amount: orderAmount,
      // These fields might be required by KCP
      buyerName: 'Popdoge Player',
      buyerEmail: 'player@popdoge.com',
      buyerTel: '010-0000-0000',
    };

    window.NCPPay.reservation(orderData, function (response: any) {
      if (response.result === 'SUCCESS') {
        // Here, we would ideally confirm the payment on our backend
        // For now, we will just call the RPC directly from the client as a simple implementation
        // This is similar to what we did with PayPal
        console.log('KCP Reservation Success:', response);
        alert('결제가 예약되었습니다. 최종 확인이 필요합니다.'); // Placeholder alert
        // TODO: Implement server-side validation using the confirmUrl
        // For now, we assume it's successful and call the RPC
        // This part needs to be connected to a secure backend confirmation later.
        // Let's assume we need to call increment_country_score
        // const { error } = await supabase.rpc('increment_country_score', ...);
      } else {
        alert(`결제 실패: ${response.message}`);
      }
    });
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-xl bg-green-50">
      <h3 className="font-bold text-lg">⚡️ 국가 부스트 (₩100)</h3>
      <p className="text-sm text-gray-800 mb-3">
        NHN KCP로 결제하고 1,000점을 즉시 부스트하세요!
      </p>
      <button
        onClick={handlePayment}
        className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-700"
      >
        100원 부스트
      </button>
    </div>
  );
}
