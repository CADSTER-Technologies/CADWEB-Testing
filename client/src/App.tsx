import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import PortfolioSection from "./components/PortfolioSection";
import TechnologySection from "./components/TechnologySection";
import DataFlowSection from "./components/DataFlowSection";
import ModelViewer from "./components/ModelViewer";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

// Product pages
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductViewerPage from "./pages/ProductViewerPage";

// Legal pages
import LicensePage from "./pages/License";
import TermsPage from "./pages/Terms";
import PrivacyPage from "./pages/Privacy";

function HomePage() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(0, 225, 255, 0.05), transparent 40%)`,
        }}
      />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <TechnologySection />
      <DataFlowSection />
      <ModelViewer />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Home */}
        <Route path="/" element={<HomePage />} />

        {/* Products flow */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/viewer" element={<ProductViewerPage />} />

        {/* Legal */}
        <Route path="/license" element={<LicensePage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Optional: redirect unknown paths to /products */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
