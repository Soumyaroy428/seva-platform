'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, FileText, ArrowLeft, Heart, Loader2, Clock, XCircle, User, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id') || searchParams.get('order_id') || searchParams.get('paymentId') || searchParams.get('txnId') || searchParams.get('donationId');

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setError('No payment or donation reference found in URL.');
      setLoading(false);
      return;
    }

    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payments/status/${paymentId}`);
        const data = await res.json();
        if (data.success && (data.donation || data.payment)) {
          setPayment(data.donation || data.payment);
        } else {
          setError(data.error || 'Payment record pending verification.');
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
          <p className="font-medium text-sm">Verifying your contribution with payment network...</p>
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
          <h1 className="text-2xl font-black text-slate-800">Record Not Found</h1>
          <p className="text-slate-500 text-sm">{error || 'We could not locate this payment record.'}</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-slate-600 font-bold hover:text-slate-800 bg-slate-100 px-5 py-2.5 rounded-full text-xs">
              <ArrowLeft className="w-4 h-4" /> Return Home
            </Link>
            <Link href="/donor" className="inline-flex items-center justify-center gap-2 text-white font-bold bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-full text-xs shadow-sm">
              <User className="w-4 h-4" /> Donor Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = payment.status || 'PENDING';
  const isVerifiedSuccess = status === 'SUCCESS' || status === 'Successful' || status === 'Verified';
  const isPendingVerification = status === 'PENDING_VERIFICATION' || status === 'Verification Required' || status === 'PENDING';
  const isFailedOrRejected = status === 'FAILED' || status === 'REJECTED' || status === 'Rejected';

  const formattedAmount = (
    payment.amountPaise 
      ? (Number(payment.amountPaise) / 100) 
      : (Number(payment.amount) || 0)
  ).toFixed(2);

  const receiptId = payment.donationId || payment.receiptId || payment.id || payment.transactionId || 'SEVA-REC';
  const donorDisplayName = payment.donorName || (payment.donorEmail ? payment.donorEmail.split('@')[0] : '') || (payment.email ? payment.email.split('@')[0] : 'Kind Donor');
  const donorEmail = payment.donorEmail || payment.email || 'donor@example.com';
  const donorPhone = payment.donorPhone || payment.contact || '';
  const campaignTitle = payment.campaignTitle || 'General Hunger Relief & Nutrition Aid';
  const paymentMethod = payment.paymentMethod || payment.method || 'UPI';
  const transactionRef = payment.transactionId || payment.utr || payment.paymentId || 'N/A';

  const paymentDate = payment.createdAt 
    ? new Date(payment.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : (payment.created_at 
        ? new Date(payment.created_at * 1000).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white">
      {/* Non-printable top action bar */}
      <div className="fixed top-6 left-6 right-6 flex items-center justify-between print:hidden pointer-events-none z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 font-bold hover:text-orange-600 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-md text-xs pointer-events-auto">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        <Link href="/donor" className="inline-flex items-center gap-2 text-slate-700 font-bold hover:text-orange-600 bg-white/95 backdrop-blur px-4 py-2 rounded-full shadow-md text-xs pointer-events-auto">
          <User className="w-4 h-4 text-orange-600" /> Donor Dashboard
        </Link>
      </div>

      <div className="max-w-2xl w-full pt-12 sm:pt-6">
        {/* State 1: Awaiting Verification (Section 8 Rule: Never display success before verification!) */}
        {isPendingVerification && !isVerifiedSuccess && (
          <div className="text-center mb-8 print:hidden">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-amber-200">
              Awaiting Admin Verification
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Payment Submitted — Awaiting Verification
            </h1>
            <p className="text-slate-600 mt-2 max-w-lg mx-auto text-sm">
              Thank you for submitting your contribution. Under our Anti-Fraud reconciliation policy, your manual UPI payment is held until verified against actual bank credit records.
            </p>
          </div>
        )}

        {/* State 2: Verified Success (Section 8 Rule: 🙏 Thank You for Supporting Seva!) */}
        {isVerifiedSuccess && (
          <div className="text-center mb-8 print:hidden">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-emerald-200">
              Verified & Reconciled
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              🙏 Thank You for Supporting Seva!
            </h1>
            <p className="text-slate-600 mt-2 text-sm font-medium">
              Your donation has been successfully received and allocated directly to warm meals.
            </p>
          </div>
        )}

        {/* State 3: Failed or Rejected */}
        {isFailedOrRejected && (
          <div className="text-center mb-8 print:hidden">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-rose-200">
              Payment Not Verified
            </span>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Payment Verification Unsuccessful
            </h1>
            <p className="text-slate-600 mt-2 text-sm max-w-md mx-auto">
              {payment.rejectionReason || 'The payment reference could not be reconciled against bank statements.'}
            </p>
          </div>
        )}

        {/* The Receipt / Details Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none border border-slate-200">
          {/* Header */}
          <div className={`p-8 sm:p-10 text-center relative print:bg-white print:text-black print:border-b-2 print:border-slate-200 ${
            isVerifiedSuccess ? 'bg-slate-900 text-white' : isPendingVerification ? 'bg-amber-900 text-white' : 'bg-rose-950 text-white'
          }`}>
            <Heart className="w-8 h-8 text-orange-500 mx-auto mb-3 print:text-slate-800" />
            <h2 className="text-2xl font-black uppercase tracking-widest">SEVA HUMANITARIAN FOUNDATION</h2>
            <p className="text-slate-300 mt-1 text-xs font-bold uppercase tracking-wider print:text-slate-600">
              {isVerifiedSuccess ? 'OFFICIAL SECTION 80G DONATION RECEIPT' : 'CONTRIBUTION SUBMISSION ACKNOWLEDGEMENT'}
            </p>
          </div>

          {/* Body */}
          <div className="p-8 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-100 pb-6 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Donation Reference ID</p>
                <p className="font-mono text-slate-800 font-extrabold text-lg">{receiptId}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date Logged</p>
                <p className="text-slate-800 font-bold text-sm">{paymentDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100 pb-6 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Donor Information</p>
                <p className="text-slate-800 font-black text-base">{donorDisplayName}</p>
                <p className="text-slate-600 mt-1">{donorEmail}</p>
                {donorPhone && <p className="text-slate-600 mt-0.5">{donorPhone}</p>}
              </div>
              <div className="sm:text-right">
                <p className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Organization Details</p>
                <p className="text-slate-800 font-black text-base">Seva Foundation Trust</p>
                <p className="text-slate-600 mt-1">Reg. Trust No: SEVA/WB/2026/80G</p>
                <p className="text-slate-600 mt-0.5">PAN: AABTS9902K • 100% Traceable Aid</p>
              </div>
            </div>

            {/* Campaign & Amount Breakdown */}
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Designated Campaign</p>
                <p className="font-extrabold text-slate-900 text-base mt-0.5">{campaignTitle}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isVerifiedSuccess 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : isPendingVerification 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                  }`}>
                    Status: {status}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">via {paymentMethod}</span>
                </div>
              </div>

              <div className="sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Received</p>
                <p className="text-3xl font-black text-slate-900 mt-0.5">₹{formattedAmount}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Ref: {transactionRef}</p>
              </div>
            </div>

            {/* Verification Status Notice */}
            {isPendingVerification && !isVerifiedSuccess && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Awaiting Bank Settlement Verification</p>
                  <p className="text-amber-800/90 leading-relaxed">
                    Your payment reference has been securely registered in the Admin verification pipeline. Once our finance team verifies the credit on the bank statement, your official Section 80G tax receipt will be issued and emailed to <strong>{donorEmail}</strong>.
                  </p>
                </div>
              </div>
            )}

            {isVerifiedSuccess && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
                <Heart className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 fill-current" />
                <div className="space-y-1">
                  <p className="font-bold">Official Section 80G Tax Exemption Certificate</p>
                  <p className="text-emerald-800/90 leading-relaxed">
                    This official computerized document certifies that the above donation qualifies for tax deduction under Section 80G of the Income Tax Act, 1961. Unique Serial No: <strong>{receiptId}</strong>.
                  </p>
                </div>
              </div>
            )}

            {isFailedOrRejected && (
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Reconciliation Notice</p>
                  <p className="text-rose-800/90 leading-relaxed">
                    {payment.rejectionReason || 'If amount was debited from your bank account, please contact support@seva.org with your transaction UTR reference.'}
                  </p>
                </div>
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-400 italic">
                Digitally verified computer-generated receipt • Reg. Trust No: SEVA/WB/2026/80G
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden in Print) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
          {isVerifiedSuccess && (
            <button
              onClick={handleDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold shadow-xl shadow-orange-600/20 transition-all active:scale-95 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download 80G PDF Receipt</span>
            </button>
          )}

          <Link
            href="/donor"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold shadow-lg transition-all active:scale-95 text-sm"
          >
            <User className="w-4 h-4 text-orange-400" />
            <span>Go to Donor Dashboard</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-full font-bold transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
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
