'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, FileText, ArrowLeft, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('razorpay_payment_id') || searchParams.get('payment_id');
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setError('No payment ID found in URL.');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/razorpay/payment/${paymentId}`);
        const data = await res.json();
        if (data.success && data.payment) {
          setPayment(data.payment);
        } else {
          setError('Failed to load payment details.');
        }
      } catch (err) {
        setError('An error occurred while fetching payment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="font-medium">Verifying your contribution...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Receipt Not Found</h1>
          <p className="text-slate-500 text-sm">{error || 'We could not locate this payment record.'}</p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amount = (payment.amount / 100).toFixed(2);
  const date = new Date(payment.created_at * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      {/* Non-printable back button */}
      <div className="fixed top-6 left-6 print:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 font-bold hover:text-orange-600 bg-white px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Platform
        </Link>
      </div>

      <div className="max-w-2xl w-full">
        {/* Success Header (Hidden in Print) */}
        <div className="text-center mb-8 print:hidden">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Payment Successful!</h1>
          <p className="text-slate-600 mt-2">Thank you for your generous contribution.</p>
        </div>

        {/* The Receipt Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          {/* Receipt Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-10 text-center relative print:bg-white print:text-black print:border-b-2 print:border-slate-200">
            <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3 print:text-slate-800" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Seva Humanitarian</h2>
            <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide print:text-slate-600">OFFICIAL 80G DONATION RECEIPT</p>
          </div>

          {/* Receipt Body */}
          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-100 pb-8 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receipt Number</p>
                <p className="font-mono text-slate-800 font-bold text-lg">{payment.id}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Paid</p>
                <p className="text-slate-800 font-bold text-sm">{date}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-b border-slate-100 pb-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                <p className="text-slate-800 font-black text-lg">{payment.email.split('@')[0] || 'Kind Donor'}</p>
                <p className="text-slate-600 text-sm mt-1">{payment.email}</p>
                <p className="text-slate-600 text-sm mt-1">{payment.contact}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Organization</p>
                <p className="text-slate-800 font-black text-lg">Seva Trust India</p>
                <p className="text-slate-600 text-sm mt-1">123 Charity Lane, New Delhi</p>
                <p className="text-slate-600 text-sm mt-1">Registration No: NGO-998877</p>
              </div>
            </div>

            <div>
              <div className="bg-slate-50 rounded-xl p-6 flex justify-between items-center print:bg-white print:border print:border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">Humanitarian Relief Donation</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Eligible for Section 80G Tax Deduction</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-800">₹{amount}</p>
                  <p className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Paid via {payment.method}</p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-slate-400 italic">
                This is a computer-generated receipt and does not require a physical signature.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden in Print) */}
        <div className="mt-8 flex justify-center print:hidden">
          <button
            onClick={handleDownload}
            className="flex items-center gap-3 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold shadow-xl shadow-orange-600/20 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Download PDF Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
