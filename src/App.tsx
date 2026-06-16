import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import backgroundBlueClouds from './assets/scene/background-blue-clouds.png'
import backgroundVioletClouds from './assets/scene/background-violet-clouds.png'
import backgroundWarmClouds from './assets/scene/background-warm-clouds.png'
import hudBlue from './assets/scene/hud-blue.png'
import hudGreen from './assets/scene/hud-green.png'
import hudViolet from './assets/scene/hud-violet.png'
import lightStreaksViolet from './assets/scene/light-streaks-violet.png'
import objectAmberStack from './assets/scene/object-amber-stack.png'
import objectBlueStack from './assets/scene/object-blue-stack.png'
import objectOrb from './assets/scene/object-orb.png'
import objectRing from './assets/scene/object-ring.png'
import objectVioletStack from './assets/scene/object-violet-stack.png'
import wireframeViolet from './assets/scene/wireframe-violet.png'
import './index.css'

type SmoothScrollContextValue = {
  scrollTo: (target: string, offset?: number) => void
}

type SmoothScrollProviderProps = {
  children: ReactNode
}

type SceneCard = {
  eyebrow: string
  title: string
  body: string
}

const MotionContext = createContext<SmoothScrollContextValue | null>(null)

const SCENE_ASSETS = {
  objectViolet: objectVioletStack,
  objectBlue: objectBlueStack,
  objectAmber: objectAmberStack,
  objectRing,
  objectOrb,
  backgroundViolet: backgroundVioletClouds,
  backgroundBlue: backgroundBlueClouds,
  backgroundWarm: backgroundWarmClouds,
  wireframeViolet,
  hudViolet,
  hudBlue,
  hudGreen,
  lightStreaksViolet,
} as const

const sceneCards: SceneCard[] = [
  {
    eyebrow: '01 / Signal',
    title: 'Visual Core',
    body: 'Objet signature, lumiere, rythme et profondeur orchestras dans une seule scene.',
  },
  {
    eyebrow: '02 / System',
    title: 'Live Panels',
    body: 'Les couches HUD deviennent un cockpit visuel, pas de simples cartes posees.',
  },
  {
    eyebrow: '03 / Motion',
    title: 'Scroll Path',
    body: 'La camera traverse le decor avec une progression lisible de 0 a 100%.',
  },
]

function useSmoothScroll() {
  const context = useContext(MotionContext)

  if (!context) {
    throw new Error('useSmoothScroll must be used inside SmoothScrollProvider')
  }

  return context
}

function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({
      anchors: true,
      lerp: prefersReducedMotion ? 1 : 0.08,
      smoothWheel: !prefersReducedMotion,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.86,
    })

    lenisRef.current = lenis

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(updateLenis)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateLenis)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      scrollTo: (target: string, offset = 0) => {
        lenisRef.current?.scrollTo(target, {
          duration: 1.05,
          easing: (progress: number) => 1 - Math.pow(1 - progress, 3),
          offset,
        })
      },
    }),
    [],
  )

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

function TopBar() {
  const { scrollTo } = useSmoothScroll()

  return (
    <header className="topbar" aria-label="Navigation principale">
      <a
        className="topbar-brand"
        href="#top"
        onClick={(event) => {
          event.preventDefault()
          scrollTo('#top')
        }}
      >
        <span>PromptForge</span>
        <span>Cinematic</span>
      </a>
      <a
        className="topbar-link"
        href="#motion-scene"
        onClick={(event) => {
          event.preventDefault()
          scrollTo('#motion-scene')
        }}
      >
        Entrer dans le systeme
      </a>
    </header>
  )
}

function HeroScene() {
  const sceneRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const scene = sceneRef.current
    const viewport = viewportRef.current
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!scene || !viewport) {
      return
    }

    const ctx = gsap.context(() => {
      const alwaysVisible =
        '.scene-bg-violet, .scene-bg-blue, .scene-bg-warm, .scene-wireframe-asset, .scene-light-streaks, .signature-object-violet, .signature-object-blue, .signature-object-amber, .signature-ring, .signature-orb, .hud-panel-violet, .hud-panel-blue, .hud-panel-green, .scene-card, .scene-cta'

      if (prefersReducedMotion) {
        gsap.set(alwaysVisible, { clearProps: 'clipPath,filter,opacity,transform,visibility' })
        gsap.set('.scene-card, .scene-cta, .hud-system, .signature-ring, .signature-orb', { autoAlpha: 1 })
        return
      }

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          end: () => '+=' + Math.max(scene.offsetHeight - window.innerHeight, window.innerHeight),
          pin: viewport,
          pinSpacing: false,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      timeline
        .addLabel('intro', 0)
        .fromTo(
          '.scene-bg-violet',
          { opacity: 0.9, scale: 1.12, xPercent: 0, yPercent: -2 },
          { opacity: 1, scale: 1.06, xPercent: -1.4, yPercent: 1.2, duration: 0.95 },
          'intro',
        )
        .fromTo(
          '.signature-object-violet',
          { opacity: 0.96, rotateX: 0, rotateY: -3, rotateZ: -2.5, scale: 0.82, xPercent: 0, yPercent: 3 },
          { opacity: 1, rotateX: 0, rotateY: 4, rotateZ: 1.5, scale: 0.94, xPercent: 1.6, yPercent: -1.4, duration: 0.95 },
          'intro',
        )
        .fromTo(
          '.scene-headline',
          { clipPath: 'inset(0% 0% 0% 0%)', yPercent: 0, scale: 1 },
          { clipPath: 'inset(0% 0% 0% 0%)', yPercent: -1.4, scale: 1.015, duration: 0.95 },
          'intro',
        )
        .fromTo(
          '.signature-light-sweep',
          { autoAlpha: 0, xPercent: -112 },
          { autoAlpha: 0.95, xPercent: 118, duration: 0.72, ease: 'power3.inOut' },
          'intro+=0.14',
        )
        .fromTo(
          '.scene-wireframe-asset',
          { autoAlpha: 0.08, scale: 1.1, xPercent: -2, yPercent: 1.5 },
          { autoAlpha: 0.34, scale: 1.02, xPercent: 1.5, yPercent: -1.5, duration: 0.9 },
          'intro+=0.12',
        )
        .addLabel('objectAwake', 0.95)
        .to(
          '.signature-object-violet',
          {
            duration: 1,
            filter:
              'drop-shadow(0 0 54px rgba(195, 71, 255, 0.88)) drop-shadow(0 34px 88px rgba(71, 132, 255, 0.42))',
            rotateY: 8,
            rotateZ: 4,
            scale: 1.16,
            xPercent: 4,
            yPercent: -5,
          },
          'objectAwake',
        )
        .to(
          '.signature-halo',
          { opacity: 1, scale: 1.22, duration: 1 },
          'objectAwake',
        )
        .to(
          '.scene-light-streaks',
          { autoAlpha: 0.74, xPercent: -7, yPercent: 4, scale: 1.08, duration: 1 },
          'objectAwake',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.24, duration: 1 },
          'objectAwake',
        )
        .addLabel('cameraDive', 1.95)
        .to(
          '.scene-title-mask',
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.82,
            ease: 'power3.inOut',
            yPercent: -28,
          },
          'cameraDive',
        )
        .to(
          '.scene-subtitle',
          {
            autoAlpha: 0,
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 0.64,
            ease: 'power3.inOut',
            yPercent: -22,
          },
          'cameraDive+=0.06',
        )
        .to(
          '.scene-kicker',
          { autoAlpha: 0.34, yPercent: -12, duration: 0.5 },
          'cameraDive+=0.12',
        )
        .to(
          '.signature-system',
          { rotateX: 12, rotateY: -11, rotateZ: 12, scale: 1.1, xPercent: 14, yPercent: 9, duration: 1.12 },
          'cameraDive-=0.06',
        )
        .to(
          '.scene-wireframe-asset',
          { autoAlpha: 0.72, scale: 1.18, xPercent: -5, yPercent: -6, duration: 1.1 },
          'cameraDive',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.38, duration: 1.05 },
          'cameraDive',
        )
        .addLabel('blueprintMode', 3.05)
        .to(
          '.signature-object-violet',
          {
            autoAlpha: 0.38,
            duration: 0.92,
            filter: 'drop-shadow(0 0 26px rgba(118, 82, 255, 0.42)) saturate(0.58) brightness(0.72)',
            scale: 1.02,
          },
          'blueprintMode',
        )
        .to(
          '.scene-wireframe-asset',
          { autoAlpha: 0.96, filter: 'saturate(1.35) contrast(1.24) brightness(1.06)', scale: 1.28, duration: 0.92 },
          'blueprintMode-=0.05',
        )
        .to(
          '.scene-chapter-indicator span',
          { textShadow: '0 0 24px rgba(125, 240, 255, 0.9)', color: '#7df0ff', duration: 0.5 },
          'blueprintMode',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.52, duration: 0.86 },
          'blueprintMode',
        )
        .addLabel('systemPanels', 4)
        .fromTo(
          '.hud-system',
          { autoAlpha: 0, rotateX: 24, rotateY: -16, rotateZ: -4, scale: 0.9, xPercent: 8, yPercent: 10 },
          { autoAlpha: 1, rotateX: 9, rotateY: -8, rotateZ: 0, scale: 1, xPercent: 0, yPercent: 0, duration: 0.75 },
          'systemPanels',
        )
        .fromTo(
          '.hud-panel',
          { autoAlpha: 0, filter: 'blur(16px)', rotateY: -18, scale: 0.88, xPercent: 42, yPercent: 14, z: -220 },
          {
            autoAlpha: 0.92,
            duration: 0.8,
            ease: 'power3.out',
            filter: 'blur(0px)',
            rotateY: 0,
            scale: 1,
            stagger: 0.12,
            xPercent: 0,
            yPercent: 0,
            z: 0,
          },
          'systemPanels+=0.05',
        )
        .fromTo(
          '.scene-card',
          { autoAlpha: 0, filter: 'blur(12px)', rotateY: -12, scale: 0.9, xPercent: 26, yPercent: 18, z: -160 },
          {
            autoAlpha: 1,
            duration: 0.7,
            ease: 'power3.out',
            filter: 'blur(0px)',
            rotateY: 0,
            scale: 1,
            stagger: 0.08,
            xPercent: 0,
            yPercent: 0,
            z: 0,
          },
          'systemPanels+=0.28',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.65, duration: 0.8 },
          'systemPanels',
        )
        .addLabel('colorShift', 5)
        .to(
          '.scene-bg-blue',
          { autoAlpha: 0.82, scale: 1.03, xPercent: -2, yPercent: 0, duration: 0.8 },
          'colorShift',
        )
        .to(
          '.signature-object-blue',
          {
            autoAlpha: 0.82,
            duration: 0.78,
            filter: 'drop-shadow(0 0 48px rgba(86, 183, 255, 0.78)) drop-shadow(0 30px 92px rgba(125, 240, 255, 0.32))',
            rotateZ: -3,
            scale: 1.03,
          },
          'colorShift+=0.02',
        )
        .to(
          '.signature-object-violet',
          { autoAlpha: 0.22, duration: 0.72 },
          'colorShift+=0.1',
        )
        .to(
          '.hud-system',
          { xPercent: -4, yPercent: -5, rotateY: 8, scale: 1.03, duration: 0.88 },
          'colorShift',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.78, duration: 0.8 },
          'colorShift',
        )
        .addLabel('orbReveal', 6)
        .to(
          '.scene-bg-warm',
          { autoAlpha: 0.42, scale: 1.04, xPercent: 1.5, yPercent: -1, duration: 0.72 },
          'orbReveal-=0.14',
        )
        .fromTo(
          '.signature-ring',
          { autoAlpha: 0, rotateX: 62, rotateZ: -22, scale: 0.48, xPercent: -22, yPercent: 28, z: 220 },
          { autoAlpha: 0.96, rotateX: 58, rotateZ: 12, scale: 0.9, xPercent: -7, yPercent: 8, z: 0, duration: 0.88 },
          'orbReveal',
        )
        .fromTo(
          '.signature-orb',
          { autoAlpha: 0, filter: 'blur(12px) brightness(1.2)', scale: 0.38, xPercent: 22, yPercent: 18 },
          { autoAlpha: 0.92, filter: 'blur(0px) brightness(1.12)', scale: 0.72, xPercent: 9, yPercent: -2, duration: 0.82 },
          'orbReveal+=0.08',
        )
        .to(
          '.signature-object-amber',
          { autoAlpha: 0.72, filter: 'drop-shadow(0 0 46px rgba(255, 129, 38, 0.58))', scale: 1.01, duration: 0.72 },
          'orbReveal+=0.12',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 0.9, duration: 0.78 },
          'orbReveal',
        )
        .addLabel('finalComposition', 7)
        .to(
          '.signature-system',
          { rotateX: 18, rotateY: -4, rotateZ: 5, scale: 0.98, xPercent: 2, yPercent: 0, duration: 0.9 },
          'finalComposition',
        )
        .to(
          '.hud-system',
          { autoAlpha: 0.96, rotateX: 4, rotateY: 0, scale: 1.02, xPercent: 0, yPercent: -1, duration: 0.82 },
          'finalComposition+=0.04',
        )
        .fromTo(
          '.scene-cta',
          { autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0%)', yPercent: 22 },
          { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62, ease: 'power3.out', yPercent: 0 },
          'finalComposition+=0.18',
        )
        .to(
          '.scene-card',
          { scale: 1.015, stagger: 0.04, z: 26, duration: 0.58 },
          'finalComposition+=0.2',
        )
        .to(
          '.scene-progress-fill',
          { scaleX: 1, duration: 0.74 },
          'finalComposition',
        )
        .addLabel('sceneExit', 8)
        .to(
          '.scene-exit-wash',
          { autoAlpha: 0.74, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 },
          'sceneExit',
        )
        .to(
          '.signature-system, .hud-system, .scene-cards',
          { yPercent: -8, scale: 0.96, filter: 'blur(1.2px)', duration: 0.72 },
          'sceneExit',
        )
        .to(
          '.scene-light-streaks',
          { autoAlpha: 0.42, xPercent: -14, duration: 0.72 },
          'sceneExit',
        )
    }, scene)

    if (import.meta.env.DEV) {
      console.info('[HeroScene] active ScrollTriggers after creation:', ScrollTrigger.getAll().length)
    }

    return () => {
      ctx.revert()

      if (import.meta.env.DEV) {
        console.info('[HeroScene] active ScrollTriggers after cleanup:', ScrollTrigger.getAll().length)
      }
    }
  }, [])

  return (
    <section className="hero-scene" id="motion-scene" ref={sceneRef} aria-label="Experience cinematique PromptForge">
      <div className="hero-viewport" ref={viewportRef}>
        <div className="scene-layer scene-bg-violet" aria-hidden="true">
          <img src={SCENE_ASSETS.backgroundViolet} alt="" />
        </div>
        <div className="scene-layer scene-bg-blue" aria-hidden="true">
          <img src={SCENE_ASSETS.backgroundBlue} alt="" />
        </div>
        <div className="scene-layer scene-bg-warm" aria-hidden="true">
          <img src={SCENE_ASSETS.backgroundWarm} alt="" />
        </div>

        <div className="scene-layer scene-light-streaks" aria-hidden="true">
          <img src={SCENE_ASSETS.lightStreaksViolet} alt="" />
        </div>
        <div className="scene-layer scene-wireframe-asset" aria-hidden="true">
          <img src={SCENE_ASSETS.wireframeViolet} alt="" />
        </div>
        <div className="scene-layer scene-grid" aria-hidden="true" />
        <div className="scene-layer scene-atmosphere" aria-hidden="true" />
        <div className="scene-layer scene-grain" aria-hidden="true" />
        <div className="scene-layer scene-exit-wash" aria-hidden="true" />

        <div className="signature-system" aria-hidden="true">
          <span className="signature-halo" />
          <span className="signature-shadow" />
          <span className="signature-light-sweep" />
          <img className="signature-object signature-object-violet" src={SCENE_ASSETS.objectViolet} alt="" />
          <img className="signature-object signature-object-blue" src={SCENE_ASSETS.objectBlue} alt="" />
          <img className="signature-object signature-object-amber" src={SCENE_ASSETS.objectAmber} alt="" />
          <img className="signature-ring" src={SCENE_ASSETS.objectRing} alt="" />
          <img className="signature-orb" src={SCENE_ASSETS.objectOrb} alt="" />
        </div>

        <div className="hud-system" aria-hidden="true">
          <img className="hud-panel hud-panel-violet" src={SCENE_ASSETS.hudViolet} alt="" />
          <img className="hud-panel hud-panel-blue" src={SCENE_ASSETS.hudBlue} alt="" />
          <img className="hud-panel hud-panel-green" src={SCENE_ASSETS.hudGreen} alt="" />
        </div>

        <div className="scene-content">
          <p className="scene-kicker">Launch system / 2026</p>
          <div className="scene-title-mask">
            <h1 className="scene-headline">Forge Impact.</h1>
          </div>
          <p className="scene-subtitle">Un objet signature. Une camera scroll. Une scene prete a produire.</p>
        </div>

        <div className="scene-cards" aria-label="Principes de production">
          {sceneCards.map((card) => (
            <article className="scene-card" key={card.title}>
              <p>{card.eyebrow}</p>
              <h2>{card.title}</h2>
              <span>{card.body}</span>
            </article>
          ))}
        </div>

        <div className="scene-progress-rail" aria-hidden="true">
          <span className="scene-progress-fill" />
        </div>
        <div className="scene-chapter-indicator" aria-hidden="true">
          <span>ORBITAL BUILD</span>
        </div>

        <a className="scene-cta" href="#motion-scene" onClick={(event) => event.preventDefault()}>
          Launch the system
        </a>
      </div>
    </section>
  )
}

function App() {
  return (
    <SmoothScrollProvider>
      <div className="app-shell" id="top">
        <TopBar />
        <main>
          <HeroScene />
        </main>
      </div>
    </SmoothScrollProvider>
  )
}

export default App
