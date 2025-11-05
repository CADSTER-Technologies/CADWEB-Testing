import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaFacebook } from 'react-icons/fa';
import { Target } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-graphite to-navy border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className= "w-10 h-10 rounded-lg flex items-center justify-center">
                <span className="text-white font-orbitron font-bold text-xl"><img src="logo/cadster_logo.png" alt="Cadster logo" /></span>
              </div>
              <span className="text-white font-orbitron font-bold text-xl">
                CADSTER <span className="text-cyan">TECHNOLOGIES</span>
              </span>
            </div>
            <p className="text-white/70 font-inter mb-4 max-w-md">
              Engineering the future of design automation with cutting-edge CAD/PLM solutions.
            </p>
            <div className="flex gap-4">
              <a href="https://www.linkedin.com/company/cadster?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 glass-morphism rounded-lg flex items-center justify-center text-cyan hover:neon-glow-cyan transition-all">
                <FaFacebook className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-orbitron font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About Us', 'Services', 'Portfolio', 'Technology', 'Contact'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-white/70 hover:text-cyan font-inter transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-orbitron font-bold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/70 font-inter">
                <FiMapPin className="text-cyan mt-1 flex-shrink-0" />
                <span>33,JN Road Near Karur Vysya Bank,Anakaputhur,Chennai-600070,Tamilnadu,India</span>
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

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-white/50 font-inter text-sm text-center md:text-left">
            © 2023-2025 Cadster Technologies. All rights reserved. | Innovating Design Automation
          </p>

          <div className="flex gap-6 text-sm font-inter">
            {[
              { name: 'License', href: '/license', newTab: true },
              { name: 'Terms & Conditions', href: '/terms', newTab: true },
              { name: 'Privacy Policy', href: '/privacy', newTab: true },
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
