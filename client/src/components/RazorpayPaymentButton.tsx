'use client';
import React, { useEffect, useRef } from 'react';

export default function RazorpayPaymentButton({ paymentButtonId }: { paymentButtonId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const form = document.createElement('form');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', paymentButtonId);
      script.async = true;
      form.appendChild(script);
      containerRef.current.appendChild(form);
    }
  }, [paymentButtonId]);

  return <div ref={containerRef} className="flex justify-center w-full mt-2"></div>;
}
