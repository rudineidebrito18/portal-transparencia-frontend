'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdFacebook, MdHome, MdEmail, MdSettings, MdSearch, MdAccessibility, MdInfo, MdHeadsetMic,
  MdExpandMore, MdMenu, MdClose
} from 'react-icons/md';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoSelos, setShowLogoSelos] = useState(true);
  const [offsetY, setOffsetY] = useState(0);
  const topbarRef = useRef<HTMLDivElement>(null);
  const logoSelosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Limite para quando o logo/selos começam a desaparecer
      const threshold = 150; // ajuste conforme altura do logo + selos

      // Controla o deslocamento vertical para animar o bloco logo+selos+nav subindo
      if (scrollY < threshold) {
        setOffsetY(scrollY);
        setShowLogoSelos(true);
      } else {
        setOffsetY(threshold);
        setShowLogoSelos(false);
      }

      // Se menu estiver aberto, fecha no scroll
      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  // Alturas fixas para animar o bloco
  const topbarHeight = 28; // px, altura do topbar
  const logoSelosHeight = 120; // px, altura do bloco logo+selos (ajuste se necessário)
  const navHeight = 48; // px, altura do nav (ajuste)

  // Calcula o translateY do bloco que contém logo + selos + nav
  // Primeiro sobe o bloco inteiro até que o nav "grude" no topbar, depois some o logo e selos com opacidade + height 0
  // O total do deslocamento para esconder logo/selos é logoSelosHeight, e para fixar o nav é logoSelosHeight - navHeight

  // Vamos dividir o movimento em duas fases:
  // 1) De 0 até (logoSelosHeight - navHeight): bloco todo sobe (translateY negativo)
  // 2) Depois disso, o logo/selos desaparecem (altura e opacidade vão pra 0)
  const fase1Max = logoSelosHeight - navHeight; // ex: 80 - 48 = 32

  // translateY para bloco logoSelos + nav:
  let translateY = 0;
  let logoSelosVisible = true;
  if (offsetY <= fase1Max) {
    translateY = -offsetY;
    logoSelosVisible = true;
  } else {
    translateY = -fase1Max;
    logoSelosVisible = false;
  }

  return (
    <>
      {/* Topbar fixo no topo */}
      <div
        ref={topbarRef}
        className="fixed top-0 left-0 w-full bg-blue-900 text-white text-sm flex justify-between items-center px-4"
        style={{ height: topbarHeight, lineHeight: `${topbarHeight}px`, zIndex: 60 }}
      >
        <div className="text-xs">Prefeitura Municipal de Lago dos Rodrigues</div>
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1"><MdHeadsetMic /> Ouvidoria/SIC</div>
          <div className="flex items-center gap-1"><MdInfo /> Transparência</div>
          <div className="flex items-center gap-1"><MdAccessibility /> Acessibilidade</div>
          <div className="flex items-center gap-1"><MdSearch /> Pesquisar</div>
          <a href="#"><MdFacebook /></a>
          <a href="#"><MdFacebook /></a>
          <a href="#"><MdEmail /></a>
          <a href="#"><MdSettings /></a>
        </div>
      </div>

      {/* Bloco logo + selos + nav, que será animado subindo */}
      <div
        ref={logoSelosRef}
        className="fixed top-[28px] left-0 w-full bg-white z-50 shadow"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Logo + selos - some quando scroll passa do limite */}
        <div
          className="flex justify-around items-center px-4"
          style={{
            height: logoSelosVisible ? logoSelosHeight : fase1Max,
            opacity: logoSelosVisible ? 1 : 0,
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, height 0.3s ease',
          }}
        >
          <div className="w-40 md:w-48">
            <img src="/logo_lago_r.png" alt="Logo Lago dos Rodrigues" className="w-[100px] h-auto" />
          </div>
          <div className="hidden md:flex gap-3">
            <img src="/selo1.png" className="h-12 md:h-14" />
            <img src="/selo2.png" className="h-12 md:h-14" />
            <img src="/selo3.png" className="h-12 md:h-14" />
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="bg-blue-900 text-white text-sm shadow">
          <ul className={`flex flex-col md:flex-row px-4 md:px-6 py-2 gap-2 md:gap-6 justify-center items-center ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
            <li className="hover:underline cursor-pointer"><MdHome /></li>
            <li className="hover:underline cursor-pointer flex items-center gap-1">A PREFEITURA <MdExpandMore /></li>
            <li className="hover:underline cursor-pointer flex items-center gap-1">O MUNICÍPIO <MdExpandMore /></li>
            <li className="hover:underline cursor-pointer flex items-center gap-1">SECRETARIAS <MdExpandMore /></li>
            <li className="hover:underline cursor-pointer">DIÁRIO OFICIAL</li>
            <li className="hover:underline cursor-pointer">SERVIÇOS</li>
            <li className="hover:underline cursor-pointer">TRANSPARÊNCIA</li>
            <li className="hover:underline cursor-pointer flex items-center gap-1">LRF E CONTAS PÚBLICAS <MdExpandMore /></li>
            <li className="hover:underline cursor-pointer flex items-center gap-1">PUBLICAÇÕES <MdExpandMore /></li>
          </ul>
        </nav>
      </div>

      {/* Botão menu fixo no topo em mobile */}
      <div className="fixed top-2 right-3 md:hidden z-60">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-blue-900 text-3xl bg-white rounded-full p-2 shadow-lg transition duration-200 hover:bg-blue-100"
          aria-label="Menu"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>
      <div className="pt-[140px] md:pt-[180px]" />
    </>
  );
}
