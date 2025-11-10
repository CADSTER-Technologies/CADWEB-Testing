import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import {
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";
import { Target } from "lucide-react";
import { Globe2, Clock3 } from 'lucide-react';
import { useEffect, useState } from "react";

export default function Footer() {
  const [utcTime, setUtcTime] = useState("");
  const [istTime, setIstTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const utcString = now.toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");
      const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const istString = istDate.toISOString().replace("T", " ").split(".")[0].replace(/-/g, ".");

      setUtcTime(`UTC: ${utcString}`);
      setIstTime(`IST: ${istString}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <footer className="relative bg-gradient-to-b from-graphite to-navy border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10  rounded-lg flex items-center justify-center">
                <span className="text-white font-orbitron font-bold text-xl">
                  <img src="logo/cadster_logo.png" alt="Cadster logo" />
                </span>
              </div>
              <span
                className="text-transparent bg-clip-text
                   bg-[linear-gradient(90deg,#e53935_0%,#43a047_40%,#1e88e5_80%,#43a047_100%)]
                   drop-shadow-[0_0_8px_rgba(30,136,229,0.35)]
                   font-orbitron font-bold text-2xl tracking-wide
                   animate-[hueShift_6s_ease-in-out_infinite_alternate]"
              >
                CADSTER <span className="whitespace-pre">TECHNOLOGIES</span>
              </span>
            </div>
            <p className="text-white/70 font-inter mb-4 max-w-md">
              Engineering the future of design automation with cutting-edge
              CAD/PLM solutions, 3D visualization, and AR/VR technologies, AI.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/cadster?originalSubdomain=in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="#"
                className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all"
              >
                <FaFacebook className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-orbitron font-bold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/products"
                  className="text-white/70 hover:text-cyan font-inter transition-colors"
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-white/70 hover:text-cyan font-inter transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  className="text-white/70 hover:text-cyan font-inter transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="text-white/70 hover:text-cyan font-inter transition-colors"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-white/70 hover:text-cyan font-inter transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-orbitron font-bold mb-4">
              Contact Info
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 font-inter">
                <FiMapPin className="text-cyan mt-1 flex-shrink-0" />
                <span>
                  33,JN Road Near Karur Vysya
                  Bank,Anakaputhur,Chennai-600070,Tamilnadu,India
                </span>
              </li>
              <li className="flex items-center gap-2 text-white/70 font-inter">
                <FiMail className="text-cyan flex-shrink-0" />
                <span>services@cadster.in</span>
              </li>
              <li className="flex items-center gap-2 text-white/70 font-inter">
                <FiPhone className="text-cyan flex-shrink-0" />
                <span>+91 8508928087</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="text-white/80 font-inter text-sm text-left">
            <p className="whitespace-pre">
              ©   2025 Cadster Technologies. All rights reserved. | Where Engineering Meets Automation

            </p>
            <div className="mt-2 space-y-1 font-mono text-cyan">
              <p className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan" />
                <span>{utcTime}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-cyan" />
                <span>{istTime}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-inter text-right">
            {[
              { name: "License", href: "/license" },
              { name: "Terms & Conditions", href: "/terms" },
              { name: "Privacy Policy", href: "/privacy" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/70 hover:text-cyan transition-colors cursor-pointer no-underline"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}


