import { useNavigate } from "react-router-dom";
import { X } from 'lucide-react';


export default function License() {
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
          Software License Agreement
        </h1>
        <p className="text-white/80 font-inter leading-relaxed">
          This License Agreement governs the use of CADSTER Technologies software and services.
          By accessing or using our applications, you agree to comply with and be bound by this
          agreement.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">Permitted Use</h2>
        <p className="text-white/70 font-inter">
          You may use this software for commercial or non-commercial projects, provided you do
          not resell, redistribute, or claim ownership of the software or its components.
        </p>
        <h2 className="text-2xl font-bold mt-6 text-cyan">Restrictions</h2>
        <ul className="list-disc ml-6 text-white/70 space-y-2">
          <li>Do not copy, modify, or reverse-engineer the software.</li>
          <li>Do not use the software for unlawful or unethical activities.</li>
          <li>Do not remove or alter copyright notices.</li>
        </ul>
        <h2 className="text-2xl font-bold mt-6 text-cyan">Disclaimer</h2>
        <p className="text-white/70 font-inter">
          CADSTER Technologies provides the software “as is” without warranties of any kind,
          either express or implied. The company is not liable for any damages resulting from
          the use of this software.
        </p>
      </div>
    </div>
  );
}
