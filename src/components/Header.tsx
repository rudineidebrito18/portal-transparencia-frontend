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
  const [navMedidaHeight, setNavMedidaHeight] = useState(48);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  const navRef = useRef<HTMLElement>(null);
  const logoBackgroundRef = useRef<HTMLDivElement>(null);

  // Observa só a altura do <nav> (varia com o menu mobile aberto/fechado e quebras de
  // linha responsivas). O restante do header (topbar + logo) tem altura previsível e é
  // calculado direto do mesmo estado que anima a transição — evita reagir a cada frame
  // intermediário da transição CSS do logo, que causava a "tremida" no espaçador abaixo.
  useEffect(() => {
    if (!navRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setNavMedidaHeight(entry.target.clientHeight);
      }
    });

    resizeObserver.observe(navRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Lógica de scroll para encolher o header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 150;

      if (scrollY < threshold) {
        setOffsetY(scrollY);
      } else {
        setOffsetY(threshold);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const headerHeight = topbarHeight + (logoVisible ? logoSectionHeight : fase1Max) + navMedidaHeight;

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">

        {/* 1. Topbar */}
        <div
          className="sticky w-full bg-primary text-light text-sm flex justify-between items-center px-4 z-40"
          style={{ height: topbarHeight, lineHeight: `${topbarHeight}px` }}
        >
          <div className="text-xs">Prefeitura Municipal de Lago dos Rodrigues</div>
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 cursor-pointer"><MdHeadsetMic /> Ouvidoria/SIC</div>
            <div className="flex items-center gap-1 cursor-pointer"><MdInfo /> Transparência</div>
            <div className="flex items-center gap-1 cursor-pointer"><MdAccessibility /> Acessibilidade</div>
            <div className="flex items-center gap-1 cursor-pointer"><MdSearch /> Pesquisar</div>
            <a href="#"><MdFacebook /></a>
            <a href="#"><MdEmail /></a>
            <a href="#"><MdSettings /></a>
          </div>
        </div>

        {/* 2. Logo e Nav (Com efeito de subida no scroll) */}
        <div
          ref={logoBackgroundRef}
          className="w-full bg-light shadow"
          style={{
            transform: `translateY(${translateY}px)`,
          }}
        >
          {/* Logo Section */}
          <div
            className="flex justify-start items-center px-4 bg-cover bg-center"
            style={{
              height: logoVisible ? logoSectionHeight : fase1Max,
              opacity: logoVisible ? 1 : 0,
              overflow: 'hidden',
              transition: 'opacity 0.3s ease, height 0.3s ease',
              backgroundImage: "url('/fundo_header.png')",
            }}
          >
            <Link href="/" className="w-40 md:w-68 flex items-center ml-20 hover:opacity-90 transition-opacity">
              <Image
                src="/logo_lago_r.png"
                alt="Logo Lago dos Rodrigues"
                width={200}
                height={200}
                priority
              />
            </Link>
          </div>

          {/* Nav */}
          <nav ref={navRef} className="bg-primary text-light text-sm shadow">
            <ul className={`flex flex-col lg:flex-row flex-wrap gap-2 md:gap-2 justify-center items-center ${menuOpen ? 'flex' : 'hidden lg:flex'}`}>
              <Link className="px-4 py-2 hover:bg-secondary" href="/" onClick={() => setMenuOpen(false)}><MdHome /></Link>

              <DropdownMenuItem label="A PREFEITURA">
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Gabinete do Prefeito</Link>
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Controladoria</Link>
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Procuradoria</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="O MUNICÍPIO">
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>História</Link>
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Símbolos</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="SECRETARIAS">
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Saúde</Link>
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Educação</Link>
              </DropdownMenuItem>

              <Link href="/diario-oficial" className="px-2 py-2 hover:bg-secondary cursor-pointer" onClick={() => setMenuOpen(false)}>DIÁRIO OFICIAL</Link>
              <Link href="#" className="px-2 py-2 hover:bg-secondary cursor-pointer" onClick={() => setMenuOpen(false)}>SERVIÇOS</Link>
              <Link href="#" className="px-2 py-2 hover:bg-secondary cursor-pointer" onTouchEnd={() => setMenuOpen(false)}>TRANSPARÊNCIA</Link>

              <DropdownMenuItem label="RECURSOS HUMANOS">
                <Link href="/servidores" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Servidores</Link>
                <Link href="/folha-pagamento" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Folha de Pagamento</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="LRF E CONTAS PÚBLICAS">
                <Link href="/gestao-fiscal" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Gestão Fiscal</Link>
                <Link href="/prestacao-contas" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Prestação de Contas</Link>
                <Link href="/planejamento" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Planejamento (LDO, LOA, PPA)</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="PUBLICAÇÕES">
                <Link href="/noticias" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Notícias</Link>
                <Link href="/avisos" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Avisos</Link>
                <Link href="#" className="px-4 py-2 hover:bg-neutral-dark block" onClick={() => setMenuOpen(false)}>Editais</Link>
              </DropdownMenuItem>
            </ul>
          </nav>
        </div>
      </div>

      {/* Botão menu mobile (Z-index maior que o header) */}
      <div className="fixed top-2 right-3 lg:hidden z-[70]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-primary text-3xl bg-light rounded-full p-2 shadow-lg"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      <div style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300" />
    </>
  );
}