'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  MdAccessibility,
  MdClose,
  MdEmail,
  MdFacebook,
  MdHeadsetMic,
  MdHome,
  MdInfo,
  MdMenu,
  MdSearch,
  MdSettings
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
            <Image src="/logo_lago_r.png" alt="Logo Lago dos Rodrigues" width={200} height={200}/>
          </div>
          <br />
        </div>

        {/* Nav */}
        <nav className="bg-primary text-light text-sm shadow">
          <ul className={`flex flex-col md:flex-row flex-wrap gap-2 md:gap-2 justify-center items-center ${menuOpen ? 'flex' : 'hidden md:flex'}`}>
            <Link className="px-4 py-2 hover:bg-secondary" href="/"><MdHome /></Link>

            <DropdownMenuItem label="A PREFEITURA">
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Gabinete do Prefeito</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Controladoria</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Procuradoria</Link>
            </DropdownMenuItem>

            <DropdownMenuItem label="O MUNICÍPIO">
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">História</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Símbolos</Link>
            </DropdownMenuItem>

            <DropdownMenuItem label="SECRETARIAS">
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Saúde</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Educação</Link>
            </DropdownMenuItem>

            <Link href="#" className="px-2 py-2 hover:bg-secondary cursor-pointer">DIÁRIO OFICIAL</Link>
            <Link href="#" className="px-2 py-2 hover:bg-secondary cursor-pointer">SERVIÇOS</Link>
            <Link href="#" className="px-2 py-2 hover:bg-secondary cursor-pointer">TRANSPARÊNCIA</Link>

            <DropdownMenuItem label="LRF E CONTAS PÚBLICAS">
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Relatórios</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Prestação de Contas</Link>
            </DropdownMenuItem>

            <DropdownMenuItem label="PUBLICAÇÕES">
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Notícias</Link>
              <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block">Editais</Link>
            </DropdownMenuItem>
          </ul>
        </nav>

      </div >

      {/* Botão menu mobile */}
      < div className="fixed top-2 right-3 md:hidden z-60" >
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-primary text-3xl bg-light rounded-full p-2 shadow-lg transition duration-200 hover:bg-[--color-neutral]"
          aria-label="Menu"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div >

      {/* Padding para o conteúdo não ficar coberto */}
      < div className="pt-[140px] md:pt-[180px]" />
    </>
  );
}
