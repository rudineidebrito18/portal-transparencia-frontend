'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MdFacebook, MdHome, MdEmail, MdSettings, MdSearch,
  MdAccessibility, MdInfo, MdHeadsetMic,
  MdExpandMore, MdMenu, MdClose
} from 'react-icons/md';
import DropdownMenuItem from './DropdownMenuItem';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [offsetY, setOffsetY] = useState(0);
  const topbarRef = useRef<HTMLDivElement>(null);
  const logoBackgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 150;

      if (scrollY < threshold) {
        setOffsetY(scrollY);
      } else {
        setOffsetY(threshold);
      }

      if (menuOpen) setMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuOpen]);

  const topbarHeight = 28;
  const logoSectionHeight = 120;
  const navHeight = 48;
  const fase1Max = logoSectionHeight - navHeight;

  let translateY = 0;
  let logoVisible = true;
  if (offsetY <= fase1Max) {
    translateY = -offsetY;
    logoVisible = true;
  } else {
    translateY = -fase1Max;
    logoVisible = false;
  }

  return (
    <>
      {/* Topbar */}
      <div
        ref={topbarRef}
        className="fixed top-0 left-0 w-full bg-primary text-light text-sm flex justify-between items-center px-4"
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

      {/* Logo com imagem de fundo + Nav */}
      <div
        ref={logoBackgroundRef}
        className="fixed top-[28px] left-0 w-full bg-light z-50 shadow"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: 'transform 0.3s ease',
        }}
      >
        <div
          className="flex justify-around items-center px-4 bg-cover bg-center"
          style={{
            height: logoVisible ? logoSectionHeight : fase1Max,
            opacity: logoVisible ? 1 : 0,
            overflow: 'hidden',
            transition: 'opacity 0.3s ease, height 0.3s ease',
            backgroundImage: "url('/fundo_header.png')",
          }}
        >
          <div className="w-40 md:w-68">
            <img src="/logo_lago_r.png" alt="Logo Lago dos Rodrigues" className="w-[200px] h-auto" />
          </div>
          <br />
        </div>

        {/* Nav */}
        <nav className="bg-primary text-light text-sm shadow">
          <ul className={`flex flex-col md:flex-row px-4 md:px-6 py-2 gap-2 md:gap-6 justify-center items-center ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
            <li className="hover:bg-secondary cursor-pointer"><MdHome /></li>

            <DropdownMenuItem label="A PREFEITURA">
              <li className="px-4 py-2 hover:bg-gray-100">Gabinete do Prefeito</li>
              <li className="px-4 py-2 hover:bg-gray-100">Controladoria</li>
              <li className="px-4 py-2 hover:bg-gray-100">Procuradoria</li>
            </DropdownMenuItem>

            <DropdownMenuItem label="O MUNICÍPIO">
              <li className="px-4 py-2 hover:bg-gray-100">História</li>
              <li className="px-4 py-2 hover:bg-gray-100">Símbolos</li>
            </DropdownMenuItem>

            <DropdownMenuItem label="SECRETARIAS">
              <li className="px-4 py-2 hover:bg-gray-100">Saúde</li>
              <li className="px-4 py-2 hover:bg-gray-100">Educação</li>
            </DropdownMenuItem>

            <li className="hover:underline cursor-pointer">DIÁRIO OFICIAL</li>
            <li className="hover:underline cursor-pointer">SERVIÇOS</li>
            <li className="hover:underline cursor-pointer">TRANSPARÊNCIA</li>

            <DropdownMenuItem label="LRF E CONTAS PÚBLICAS">
              <li className="px-4 py-2 hover:bg-gray-100">Relatórios</li>
              <li className="px-4 py-2 hover:bg-gray-100">Prestação de Contas</li>
            </DropdownMenuItem>

            <DropdownMenuItem label="PUBLICAÇÕES">
              <li className="px-4 py-2 hover:bg-gray-100">Notícias</li>
              <li className="px-4 py-2 hover:bg-gray-100">Editais</li>
            </DropdownMenuItem>
          </ul>
        </nav>

      </div>

      {/* Botão menu mobile */}
      <div className="fixed top-2 right-3 md:hidden z-60">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-primary text-3xl bg-light rounded-full p-2 shadow-lg transition duration-200 hover:bg-[--color-neutral]"
          aria-label="Menu"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      {/* Padding para o conteúdo não ficar coberto */}
      <div className="pt-[140px] md:pt-[180px]" />
    </>
  );
}
