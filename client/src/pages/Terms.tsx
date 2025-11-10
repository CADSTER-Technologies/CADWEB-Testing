import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-navy text-white py-20 px-6 md:px-20">
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 right-6 z-50 flex items-center justify-center
                   bg-red-600/20 hover:bg-red-600/40 text-red-500 border border-red-500/50
                   rounded-full w-10 h-10 transition-all duration-300
                   hover:scale-110 hover:shadow-[0_0_15px_#ff000080]"
        aria-label="Close and return to main page"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-orbitron font-bold text-cyan mb-6">
          Terms & Conditions
        </h1>
        <p className="text-white/80 font-inter">
          By using CADSTER Technologies’ website, services, or software, you agree to the
          following terms and conditions. Please read them carefully before proceeding.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">1. Acceptance of Terms</h2>
        <p className="text-white/70 font-inter">
          Accessing or using our services constitutes your agreement to these Terms. If you do
          not agree, you must discontinue use immediately.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">2. Intellectual Property</h2>
        <p className="text-white/70 font-inter">
          All content, branding, and code are the property of CADSTER Technologies and may not
          be copied or reused without written consent.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">3. Limitation of Liability</h2>
        <p className="text-white/70 font-inter">
          We are not responsible for any direct or indirect damages resulting from the use or
          inability to use our software or services.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">4. Modifications</h2>
        <p className="text-white/70 font-inter">
          CADSTER reserves the right to modify these terms at any time. Updates will be posted
          on this page with a revised effective date.
        </p>
      </div>
    </div>
  );
}
