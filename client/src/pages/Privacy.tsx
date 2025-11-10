import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';

export default function Privacy() {
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
          Privacy Policy
        </h1>
        <p className="text-white/80 font-inter">
          CADSTER Technologies respects your privacy and is committed to protecting your
          personal data. This policy outlines how we handle and safeguard your information.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">1. Information We Collect</h2>
        <p className="text-white/70 font-inter">
          We may collect personal details such as name, email address, company name, and usage
          data when you interact with our services.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">2. How We Use Your Data</h2>
        <p className="text-white/70 font-inter">
          The data we collect helps improve our software, provide customer support, and deliver
          updates or promotional communications.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">3. Data Protection</h2>
        <p className="text-white/70 font-inter">
          We implement industry-standard security measures to prevent unauthorized access,
          disclosure, or alteration of your data.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">4. Your Rights</h2>
        <p className="text-white/70 font-inter">
          You have the right to request data access, correction, or deletion by contacting
          services@cadster.in.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">5. Updates to This Policy</h2>
        <p className="text-white/70 font-inter">
          This Privacy Policy may be updated periodically. Any changes will be reflected here
          with a new “last updated” date.
        </p>
      </div>
    </div>
  );
}
