'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  MdClose,
  MdHeadsetMic,
  MdHome,
  MdInfo,
  MdMenu
} from 'react-icons/md';
import AcessibilidadeMenu from './AcessibilidadeMenu';
import DropdownMenuItem from './DropdownMenuItem';
import SecretariasDropdownItems from './SecretariasDropdownItems';

const CHAVE_FONTE = 'acessibilidade-fonte';
const CHAVE_CONTRASTE = 'acessibilidade-alto-contraste';
const FONTE_MIN = 90;
const FONTE_MAX = 130;
const FONTE_PADRAO = 100;
const PASSO = 10;

export default function Header() {
  const [navMedidaHeight, setNavMedidaHeight] = useState(48);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  // Dono único do estado de acessibilidade — AcessibilidadeMenu é renderizado 2x aqui
  // embaixo (topbar desktop + menu mobile), cada instância só reflete esse estado em vez
  // de ter o próprio (isso causava dessincronia: ativar num lugar não refletia no outro).
  const [fonte, setFonte] = useState(FONTE_PADRAO);
  const [altoContraste, setAltoContraste] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const logoBackgroundRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fonteSalva = Number(localStorage.getItem(CHAVE_FONTE));
    if (fonteSalva) {
      document.documentElement.style.fontSize = `${fonteSalva}%`;
      setFonte(fonteSalva);
    }

    const contrasteSalvo = localStorage.getItem(CHAVE_CONTRASTE) === 'true';
    if (contrasteSalvo) {
      document.documentElement.classList.add('alto-contraste');
      setAltoContraste(true);
    }
  }, []);

  function aplicarFonte(valor: number) {
    const novoValor = Math.min(FONTE_MAX, Math.max(FONTE_MIN, valor));
    document.documentElement.style.fontSize = `${novoValor}%`;
    localStorage.setItem(CHAVE_FONTE, String(novoValor));
    setFonte(novoValor);
  }

  function alternarContraste() {
    const novoValor = !altoContraste;
    document.documentElement.classList.toggle('alto-contraste', novoValor);
    localStorage.setItem(CHAVE_CONTRASTE, String(novoValor));
    setAltoContraste(novoValor);
  }

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
  const logoSectionHeight = 92;
  const navHeight = 48;

  // Só marca ativo o item de topo (Diário Oficial/Transparência) — os dropdowns agrupam
  // várias rotas e "qual sub-item está ativo" já é respondido pelo Breadcrumbs de cada
  // página, não precisa duplicar aqui.
  const linkAtivo = (href: string) => pathname === href;
  const classeLink = (href: string) =>
    `rounded-md transition-colors cursor-pointer border-b-2 ${
      linkAtivo(href)
        ? 'border-secondary font-semibold'
        : 'border-transparent hover:bg-white/10'
    }`;
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

  // "Glass on scroll": nav sólido no topo da página, e vira translúcido+desfocado só
  // depois que a logo já recolheu — sensação de header flutuando sobre o conteúdo, sem
  // ficar vidro o tempo todo (o pedido explícito era "glassmorphism só onde faz
  // sentido"). Desligado no alto contraste de propósito: `bg-primary/85` é uma classe
  // diferente de `.bg-primary` (o seletor de alto contraste casa por classe literal, não
  // por cor computada — mesma pegadinha já documentada em `.bg-primary-gradient`), então
  // em vez de mais um seletor CSS pra cobrir isso, a própria condição já usa o estado
  // `altoContraste` que o componente já tem.
  const navFlutuante = !logoVisible && !altoContraste;

  return (
    <>
      {/* pointer-events: none aqui de propósito — sem altura própria, esse container
          herdaria a altura "natural" (pré-translateY) do conteúdo, já que translateY só
          reposiciona visualmente, não encolhe a caixa. Isso deixava uma faixa invisível
          do header (ainda dentro da caixa fixed/z-50, ainda capturando clique por
          padrão) sentada em cima do conteúdo da página logo abaixo do nav, sempre que o
          header estava colapsado ou a meio caminho do scroll. Tentamos consertar dando
          altura explícita à caixa (headerHeight + translateY), mas isso forçava reflow
          (recalcular `height`, propriedade de layout) a cada pixel do scroll — offsetY
          não tem throttle, então rodava em toda tick de scroll e causava tremida visível
          na página. `pointer-events` não dispara layout/reflow (só afeta hit-testing),
          então resolve o mesmo problema sem custo de performance: o container em si
          vira "transparente" a clique, e só os filhos com pointer-events-auto (topbar e
          logo+nav) voltam a capturar — clique na área vazia atravessa direto pro
          conteúdo da página. */}
      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">

        {/* 1. Topbar */}
        <div
          className="sticky w-full bg-primary text-light text-sm flex justify-between items-center px-4 z-40 pointer-events-auto border-b border-white/10"
          style={{ height: topbarHeight, lineHeight: `${topbarHeight}px` }}
        >
          <div className="text-xs text-white/80">Prefeitura Municipal de Lago dos Rodrigues</div>
          <div className="hidden lg:flex items-center gap-4 text-xs text-white/80">
            <div className="flex items-center gap-1">
              <MdHeadsetMic />
              <Link href="/ouvidoria" className="hover:text-white hover:underline transition-colors">Ouvidoria</Link>
              <span aria-hidden="true">/</span>
              <Link href="/esic" className="hover:text-white hover:underline transition-colors">SIC</Link>
            </div>
            <Link href="/transparencia" className="flex items-center gap-1 hover:text-white hover:underline transition-colors"><MdInfo /> Transparência</Link>
            <AcessibilidadeMenu
              altoContraste={altoContraste}
              onAumentarFonte={() => aplicarFonte(fonte + PASSO)}
              onDiminuirFonte={() => aplicarFonte(fonte - PASSO)}
              onAlternarContraste={alternarContraste}
            />
          </div>
        </div>

        {/* 2. Logo e Nav (Com efeito de subida no scroll) */}
        <div
          ref={logoBackgroundRef}
          className="w-full bg-light shadow pointer-events-auto"
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
            <Link href="/" className="w-36 md:w-56 flex items-center ml-4 lg:ml-20 hover:opacity-90 transition-opacity">
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
          <nav
            ref={navRef}
            className={`text-light text-sm shadow transition-colors duration-300 ${
              navFlutuante ? 'bg-primary/85 backdrop-blur-md' : 'bg-primary'
            }`}
          >
            <ul className={`flex flex-col lg:flex-row flex-wrap gap-1 justify-center items-center ${menuOpen ? 'flex' : 'hidden lg:flex'}`}>
              <Link
                className={`px-4 py-3 lg:py-2 flex items-center ${classeLink('/')}`}
                href="/"
                aria-label="Página inicial"
                onClick={() => setMenuOpen(false)}
              >
                <MdHome size={18} />
              </Link>

              <DropdownMenuItem label="A PREFEITURA">
                <Link href="/prefeito" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Prefeito</Link>
                <Link href="/vice-prefeito" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Vice-Prefeito</Link>
                <Link href="/estrutura-organizacional" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Estrutura Organizacional</Link>
                <Link href="/organograma" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Organograma</Link>
                <Link href="/competencias" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Competências</Link>
                <Link href="/carta-de-servicos" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Carta de Serviços</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="SECRETARIAS">
                <SecretariasDropdownItems onNavigate={() => setMenuOpen(false)} />
              </DropdownMenuItem>

              <Link href="/diario-oficial" className={`px-3 py-3 lg:py-2 ${classeLink('/diario-oficial')}`} onClick={() => setMenuOpen(false)}>DIÁRIO OFICIAL</Link>
              <Link href="/transparencia" className={`px-3 py-3 lg:py-2 ${classeLink('/transparencia')}`} onClick={() => setMenuOpen(false)}>TRANSPARÊNCIA</Link>

              <DropdownMenuItem label="RECURSOS HUMANOS">
                <Link href="/servidores" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Servidores</Link>
                <Link href="/folha-pagamento" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Folha de Pagamento</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="LRF E CONTAS PÚBLICAS">
                <Link href="/gestao-fiscal" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Gestão Fiscal</Link>
              </DropdownMenuItem>

              <DropdownMenuItem label="PUBLICAÇÕES">
                <Link href="/noticias" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Notícias</Link>
                <Link href="/avisos" className="px-4 py-3 lg:py-2 rounded-md hover:bg-primary/10 transition-colors block" onClick={() => setMenuOpen(false)}>Avisos</Link>
              </DropdownMenuItem>

              {/* Topbar (Ouvidoria/SIC/Acessibilidade) é `hidden lg:flex` — some inteira no
                  mobile. Só o menu de Acessibilidade tem equivalente aqui por enquanto
                  (pedido explícito do usuário); Ouvidoria/SIC seguem sem alternativa
                  mobile. */}
              <div className="lg:hidden px-2 py-2">
                <AcessibilidadeMenu
                  altoContraste={altoContraste}
                  onAumentarFonte={() => aplicarFonte(fonte + PASSO)}
                  onDiminuirFonte={() => aplicarFonte(fonte - PASSO)}
                  onAlternarContraste={alternarContraste}
                />
              </div>
            </ul>
          </nav>
        </div>
      </div>

      {/* Botão menu mobile (Z-index maior que o header) */}
      <div className="fixed top-2 right-3 lg:hidden z-[70]">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          className="text-primary text-2xl bg-light rounded-full p-2.5 shadow-lg hover:bg-neutral-light transition-colors"
        >
          {menuOpen ? <MdClose /> : <MdMenu />}
        </button>
      </div>

      <div style={{ paddingTop: `${headerHeight}px` }} className="transition-[padding] duration-300" />
    </>
  );
}