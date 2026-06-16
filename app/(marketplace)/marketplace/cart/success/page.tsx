import Link from "next/link";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Purchase Successful | Virtual Horizon Marketplace",
  description: "Your asset purchase was successful."
};

export default function CartSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#121826] border border-marketplace-border rounded-2xl p-10 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-white">Payment Successful!</h1>
          <p className="text-sm text-slate-400 font-semibold leading-relaxed">
            Your purchase is complete. The assets have been added to your library and are ready to download.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/marketplace/assets/my"
            className="w-full bg-marketplace-primary text-white py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Package className="w-4 h-4" /> Go to My Assets
          </Link>
          <Link
            href="/marketplace/assets"
            className="w-full bg-white/5 border border-marketplace-border text-slate-300 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-400 font-semibold text-left space-y-1">
          <p className="font-extrabold text-emerald-300">✓ What happens next?</p>
          <ul className="space-y-0.5 list-disc list-inside text-slate-400">
            <li>Assets are available in My Assets → Purchased tab</li>
            <li>You can download them anytime via the asset page</li>
            <li>An order receipt has been generated in your account</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
