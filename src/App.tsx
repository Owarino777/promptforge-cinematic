import { useEffect, useRef } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import CinematicJourney, { type JourneyChapter } from './components/CinematicJourney'
import './index.css'

type VideoBackgroundProps = {
  src: string
  title: string
  autoPlay?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onVideo?: (node: HTMLVideoElement | null) => void
}

const VIDEOS = {
  hero: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_031045_0e1165dd-ab48-46e3-ad3d-5fe77f217647.mp4',
  chapterOne:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4',
  chapterTwo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_101827_abebfeec-f243-466b-b494-7f6814c0fbbf.mp4',
  chapterThree:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_182501_0216c2be-1b2f-40d3-8716-0d4f42e73b44.mp4',
  chapterFour:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4',
  chapterFive:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4',
  textureOne:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260422_191657_800d4e1f-7ab3-41af-90b6-9bd3039eb294.mp4',
  textureTwo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_182501_0216c2be-1b2f-40d3-8716-0d4f42e73b44.mp4',
  textureThree:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260422_112520_ee819691-f2e8-4c54-bb77-3fb72c84eaa5.mp4',
  final:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4',
} as const

const journeyChapters: JourneyChapter[] = [
  {
    id: 'origin',
    act: 'I',
    label: 'Origine',
    title: 'Une idee surgit.',
    line: 'Pas encore un site. Pas encore un prompt. Juste une tension visuelle qui demande une forme.',
    video: VIDEOS.chapterOne,
    transition: 'shutter',
    textureVideo: VIDEOS.textureOne,
  },
  {
    id: 'cut',
    act: 'II',
    label: 'Coupe',
    title: 'On retire le decor.',
    line: 'Tout ce qui ressemble a une landing page disparait: grilles sages, cartes molles, fausse profondeur.',
    video: VIDEOS.chapterTwo,
    transition: 'shutter',
    textureVideo: VIDEOS.textureTwo,
  },
  {
    id: 'world',
    act: 'III',
    label: 'Monde',
    title: 'La scene prend le dessus.',
    line: 'Le media devient l interface. Le scroll ne visite plus des blocs: il traverse une sequence.',
    video: VIDEOS.chapterThree,
    transition: 'split',
    textureVideo: VIDEOS.textureThree,
  },
  {
    id: 'codex',
    act: 'IV',
    label: 'Codex',
    title: 'La vision devient executable.',
    line: 'Chaque choix est converti en contrainte claire: rythme, contraste, hierarchie, mouvement, sortie production.',
    video: VIDEOS.chapterFour,
    transition: 'curtain',
    textureVideo: VIDEOS.textureOne,
  },
  {
    id: 'release',
    act: 'V',
    label: 'Sortie',
    title: 'Le trailer devient site.',
    line: 'Une experience premium, pilotable, responsive, et assez forte pour ne pas avoir besoin de se justifier.',
    video: VIDEOS.chapterFive,
    transition: 'iris',
    textureVideo: VIDEOS.textureThree,
  },
]

function VideoBackground({ src, title, autoPlay = true, preload = 'metadata', onVideo }: VideoBackgroundProps) {
  return (
    <div className="video-shell" aria-hidden="true">
      <div className="video-fallback" />
      <video className="video-media" autoPlay={autoPlay} muted playsInline loop preload={preload} ref={onVideo}>
        <source src={src} type="video/mp4" />
        {title}
      </video>
    </div>
  )
}

function App() {
  const appRef = useRef<HTMLDivElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const lenisRafRef = useRef<((time: number) => void) | null>(null)
  const heroVideoRef = useRef<HTMLVideoElement | null>(null)
  const finalVideoRef = useRef<HTMLVideoElement | null>(null)

  const scrollToTarget = (target: string, offset = 0) => {
    lenisRef.current?.scrollTo(target, {
      offset,
      duration: 1.15,
      easing: (progress: number) => 1 - Math.pow(1 - progress, 3),
    })
  }

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.05,
    })

    lenisRef.current = lenis

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000)
    }

    lenisRafRef.current = lenisRaf
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)

    const context = gsap.context(() => {
      gsap.from('.hero-kicker, .hero-title, .hero-description, .hero-actions', {
        y: 70,
        opacity: 0,
        filter: 'blur(18px)',
        duration: 1.35,
        stagger: 0.12,
        ease: 'expo.out',
      })

      gsap.to('.hero-panel .video-media', {
        scale: 1.08,
        yPercent: 3,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-panel',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      ScrollTrigger.create({
        trigger: '.hero-panel',
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => void heroVideoRef.current?.play().catch(() => undefined),
        onEnterBack: () => void heroVideoRef.current?.play().catch(() => undefined),
        onLeave: () => heroVideoRef.current?.pause(),
        onLeaveBack: () => heroVideoRef.current?.pause(),
      })

      ScrollTrigger.create({
        trigger: '.final-panel',
        start: 'top 120%',
        end: 'bottom top',
        onEnter: () => void finalVideoRef.current?.play().catch(() => undefined),
        onEnterBack: () => void finalVideoRef.current?.play().catch(() => undefined),
        onLeave: () => finalVideoRef.current?.pause(),
        onLeaveBack: () => finalVideoRef.current?.pause(),
      })

      gsap.fromTo(
        '.forge-bridge-title span',
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.forge-bridge',
            start: 'top 68%',
            toggleActions: 'play none none reverse',
          },
        },
      )

      gsap.fromTo(
        '.forge-step',
        { x: -44, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.forge-bridge',
            start: 'top 46%',
            toggleActions: 'play none none reverse',
          },
        },
      )

      gsap.to('.forge-meter-fill', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.forge-bridge',
          start: 'top 72%',
          end: 'bottom 38%',
          scrub: true,
        },
      })

      gsap.to('.forge-bridge .video-media', {
        scale: 1.1,
        yPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.forge-bridge',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, appRef)

    return () => {
      context.revert()
      if (lenisRafRef.current) {
        gsap.ticker.remove(lenisRafRef.current)
      }
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <div className="app-shell" id="top" ref={appRef}>
      <header className="topbar" aria-label="Navigation principale">
        <a className="topbar-brand" href="#top">
          <span>PromptForge</span>
          <span>Cinematic</span>
        </a>
        <a
          className="topbar-link"
          href="#sequence"
          onClick={(event) => {
            event.preventDefault()
            scrollToTarget('#sequence')
          }}
        >
          Voir le film
        </a>
      </header>

      <main>
        <section className="hero-panel" aria-label="Hero PromptForge Cinematic">
          <VideoBackground
            src={VIDEOS.hero}
            title="Video d introduction PromptForge"
            onVideo={(node) => {
              heroVideoRef.current = node
            }}
          />
          <div className="cinema-vignette" />
          <div className="letterbox" aria-hidden="true" />
          <div className="film-grain" />

          <div className="hero-layout">
            <p className="hero-kicker">Un prompt ne suffit plus.</p>
            <h1 className="hero-title">
              Fabrique
              <br />
              la scene.
            </h1>
            <p className="hero-description">
              Une experience scroll-driven en francais, construite comme une bande-annonce:
              plans reels, ruptures, tension, puis prompt Codex pret a produire.
            </p>
            <div className="hero-actions">
                <a
                  className="primary-action"
                  href="#sequence"
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToTarget('#sequence')
                  }}
                >
                  Lancer la sequence
                  <Play size={17} aria-hidden="true" />
                </a>
                <a
                  className="secondary-action"
                  href="#final-cta"
                  onClick={(event) => {
                    event.preventDefault()
                    scrollToTarget('#forge-bridge', -40)
                  }}
                >
                  Aller a la sortie
                  <ArrowUpRight size={17} aria-hidden="true" />
                </a>
            </div>
          </div>
        </section>

        <CinematicJourney chapters={journeyChapters} />

        <section className="forge-bridge" id="forge-bridge" aria-label="Passage du trailer au build">
          <VideoBackground src={VIDEOS.textureThree} title="Video de transition build PromptForge" preload="metadata" />
          <div className="cinema-vignette" />
          <div className="film-grain" />
          <div className="forge-scan" aria-hidden="true" />
          <div className="forge-bridge-layout">
            <div className="forge-bridge-copy">
              <p className="hero-kicker">Export du film vers Codex</p>
              <h2 className="forge-bridge-title">
                <span>La scene</span>
                <span>devient</span>
                <span>instruction.</span>
              </h2>
            </div>
            <div className="forge-console" aria-label="Etat de production">
              <div className="forge-console-head">
                <span>PF_BUILD_PASS</span>
                <span>READY</span>
              </div>
              <div className="forge-meter" aria-hidden="true">
                <span className="forge-meter-fill" />
              </div>
              <ol className="forge-steps">
                <li className="forge-step">
                  <span>01</span>
                  Direction visuelle verrouillee
                </li>
                <li className="forge-step">
                  <span>02</span>
                  Videos, rythme et transitions synchronises
                </li>
                <li className="forge-step">
                  <span>03</span>
                  Prompt Codex pret pour generation premium
                </li>
              </ol>
              <a
                className="primary-action forge-action"
                href="#final-cta"
                onClick={(event) => {
                  event.preventDefault()
                  scrollToTarget('#final-cta', -40)
                }}
              >
                Lancer le build
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="final-panel" id="final-cta" aria-label="Ouverture du studio">
          <VideoBackground
            src={VIDEOS.final}
            title="Video finale PromptForge"
            autoPlay={false}
            preload="auto"
            onVideo={(node) => {
              finalVideoRef.current = node
            }}
          />
          <div className="cinema-vignette" />
          <div className="letterbox" aria-hidden="true" />
          <div className="film-grain" />
          <div className="final-layout">
            <p className="hero-kicker">Fin du film. Debut du build.</p>
            <h2>
              Maintenant,
              <br />
              on forge.
            </h2>
            <a
              className="primary-action"
              href="#top"
              onClick={(event) => {
                event.preventDefault()
                scrollToTarget('#top')
              }}
            >
              Rejouer l experience
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
