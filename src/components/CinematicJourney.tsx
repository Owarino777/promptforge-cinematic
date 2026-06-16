import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export type JourneyChapter = {
  id: string
  act: string
  label: string
  title: string
  line: string
  video: string
  transition: 'shutter' | 'split' | 'curtain' | 'iris' | 'exposure'
  textureVideo: string
}

type CinematicJourneyProps = {
  chapters: JourneyChapter[]
}

type VideoLayerProps = {
  src: string
  title: string
  autoPlay?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  onVideo?: (node: HTMLVideoElement | null) => void
}

function VideoLayer({ src, title, autoPlay = false, preload = 'metadata', onVideo }: VideoLayerProps) {
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

export default function CinematicJourney({ chapters }: CinematicJourneyProps) {
  const sequenceRef = useRef<HTMLElement | null>(null)
  const pinRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLSpanElement | null>(null)
  const videoRefs = useRef<Array<HTMLDivElement | null>>([])
  const textureRefs = useRef<Array<HTMLDivElement | null>>([])
  const videoElementRefs = useRef<Array<HTMLVideoElement | null>>([])
  const textureElementRefs = useRef<Array<HTMLVideoElement | null>>([])
  const copyRefs = useRef<Array<HTMLElement | null>>([])
  const actRefs = useRef<Array<HTMLSpanElement | null>>([])

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 768px)').matches

    if (isReducedMotion || isMobile) {
      return undefined
    }

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      const videos = videoRefs.current.filter(Boolean) as HTMLDivElement[]
      const textures = textureRefs.current.filter(Boolean) as HTMLDivElement[]
      const copies = copyRefs.current.filter(Boolean) as HTMLElement[]
      const acts = actRefs.current.filter(Boolean) as HTMLSpanElement[]

      const setActiveMedia = (activeIndex: number) => {
        acts.forEach((act, index) => {
          act.classList.toggle('is-active', index === activeIndex)
        })

        videoElementRefs.current.forEach((video, index) => {
          if (!video) {
            return
          }

          const shouldKeepAlive = index === activeIndex || index === activeIndex - 1
          const shouldPrewarm = index === activeIndex + 1

          if (shouldKeepAlive) {
            void video.play().catch(() => undefined)
            return
          }

          if (shouldPrewarm) {
            video.preload = 'auto'
            video.load()
          }

          video.pause()
        })

        textureElementRefs.current.forEach((video, index) => {
          if (!video) {
            return
          }

          if (index === activeIndex && chapters[index]?.transition === 'exposure') {
            void video.play().catch(() => undefined)
            return
          }

          video.pause()
        })
      }

      gsap.set(videos, { opacity: 0, scale: 1.08, xPercent: 0, yPercent: 0, rotate: 0 })
      gsap.set(textures, { opacity: 0, scale: 1.04 })
      gsap.set(copies, { opacity: 0, y: 56 })
      gsap.set('.scene-motion-layer', { opacity: 0 })
      gsap.set('.scene-band-left', { xPercent: -135 })
      gsap.set('.scene-band-right', { xPercent: 135 })
      gsap.set('.scene-curtain', { xPercent: -120 })
      gsap.set('.scene-soft-wipe', { xPercent: -110 })
      gsap.set('.scene-focus-frame', { scale: 0.82, rotate: -2 })
      gsap.set(progressRef.current, { scaleX: 0.08, transformOrigin: 'left center' })
      gsap.set(videos[0], { opacity: 1, scale: 1.02 })
      gsap.set(copies[0], { opacity: 1, y: 0 })
      setActiveMedia(0)

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: sequenceRef.current,
          start: 'top top',
          end: `+=${chapters.length * 1650}`,
          pin: pinRef.current,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const animateTransition = (chapter: JourneyChapter, index: number, label: string) => {
        if (chapter.transition === 'split') {
          gsap.set(videos[index], { xPercent: 8, scale: 1.1 })
          timeline.to(videos[index], { opacity: 1, xPercent: 0, scale: 1.02, duration: 1 }, label)
          timeline.fromTo('.scene-band-left', { opacity: 0, xPercent: -135 }, { opacity: 0.72, xPercent: 150, duration: 0.84 }, label)
          timeline.fromTo('.scene-band-right', { opacity: 0, xPercent: 135 }, { opacity: 0.5, xPercent: -145, duration: 0.9 }, `${label}+=0.08`)
          timeline.fromTo('.scene-soft-wipe', { opacity: 0, xPercent: -110 }, { opacity: 0.26, xPercent: 120, duration: 0.9 }, label)
          timeline.to('.scene-band-left, .scene-band-right, .scene-soft-wipe', { opacity: 0, duration: 0.28 }, `${label}+=0.82`)
          return
        }

        if (chapter.transition === 'curtain') {
          gsap.set(videos[index], { yPercent: 7, scale: 1.1 })
          timeline.to(videos[index], { opacity: 1, yPercent: 0, scale: 1.02, duration: 1.04 }, label)
          timeline.fromTo('.scene-curtain', { opacity: 0, xPercent: -120 }, { opacity: 0.32, xPercent: 255, duration: 0.98 }, label)
          timeline.fromTo('.scene-flare', { opacity: 0, xPercent: -95 }, { opacity: 0.26, xPercent: 95, duration: 0.9 }, `${label}+=0.08`)
          timeline.to('.scene-curtain, .scene-flare', { opacity: 0, duration: 0.28 }, `${label}+=0.82`)
          return
        }

        if (chapter.transition === 'iris') {
          gsap.set(videos[index], { rotate: -0.8, scale: 1.16 })
          const isFinal = index === chapters.length - 1
          timeline.to(videos[index], { opacity: 1, rotate: 0, scale: isFinal ? 1 : 1.02, duration: isFinal ? 1.35 : 1.08 }, label)
          timeline.fromTo('.scene-focus-frame', { opacity: 0, scale: 0.82, rotate: -2 }, { opacity: 0.45, scale: 1.08, rotate: 0, duration: 0.68 }, label)
          timeline.to('.scene-focus-frame', { opacity: 0, scale: 1.18, duration: 0.48 }, `${label}+=0.56`)
          timeline.fromTo('.scene-iris-ring', { opacity: 0, scale: 0.82 }, { opacity: 0.24, scale: 1.14, duration: 0.52 }, label)
          timeline.to('.scene-iris-ring', { opacity: 0, scale: 1.26, duration: 0.5 }, `${label}+=0.5`)
          if (isFinal) {
            timeline.fromTo('.scene-soft-wipe', { opacity: 0, xPercent: -120 }, { opacity: 0.34, xPercent: 130, duration: 1.05 }, `${label}+=0.1`)
            timeline.to('.scene-soft-wipe', { opacity: 0, duration: 0.32 }, `${label}+=1.02`)
          }
          return
        }

        if (chapter.transition === 'exposure') {
          gsap.set(videos[index], { scale: 1.14 })
          timeline.to(textures[index], { opacity: 0.2, scale: 1, duration: 0.42 }, label)
          timeline.to(videos[index], { opacity: 1, scale: 1.02, duration: 1 }, label)
          timeline.to(textures[index], { opacity: 0, scale: 1.05, duration: 0.5 }, `${label}+=0.42`)
          return
        }

        timeline.to(videos[index], { opacity: 1, scale: index % 2 === 0 ? 1.03 : 1.02, duration: 0.88 }, label)
      }

      chapters.forEach((chapter, index) => {
        const label = chapter.id
        timeline.addLabel(label)
        timeline.call(() => setActiveMedia(index), [], label)
        timeline.to(progressRef.current, { scaleX: (index + 1) / chapters.length, duration: 0.7 }, label)

        animateTransition(chapter, index, label)

        if (chapter.transition === 'shutter' && index > 0) {
          timeline.fromTo('.scene-shutter', { opacity: 0, scaleX: 0 }, { opacity: 0.5, scaleX: 1, duration: 0.18 }, label)
          timeline.to('.scene-shutter', { opacity: 0, duration: 0.34 }, `${label}+=0.18`)
          timeline.fromTo('.scene-band-left', { opacity: 0, xPercent: -135 }, { opacity: 0.44, xPercent: 150, duration: 0.62 }, `${label}+=0.04`)
          timeline.to('.scene-band-left', { opacity: 0, duration: 0.22 }, `${label}+=0.58`)
        }

        timeline.to(copies[index], { opacity: 1, y: 0, duration: 0.72 }, `${label}+=0.14`)

        if (index > 0) {
          const exitDirection = index % 2 === 0 ? -7 : 7
          const exitDelay = index === chapters.length - 1 ? 0.48 : 0.18
          const exitDuration = index === chapters.length - 1 ? 1.05 : 0.68
          timeline.to(videos[index - 1], { opacity: 0, scale: 1.06, xPercent: exitDirection, duration: exitDuration }, `${label}+=${exitDelay}`)
          timeline.to(copies[index - 1], { opacity: 0, y: -46, duration: 0.48 }, `${label}+=0.08`)
        }

        timeline.to(
          '.scene-title-ghost',
          {
            yPercent: -12 - index * 6,
            opacity: 0.09 + index * 0.02,
            duration: 0.92,
            ease: 'none',
          },
          label,
        )
      })
    }, sequenceRef)

    return () => {
      context.revert()
    }
  }, [chapters])

  return (
    <section className="sequence-shell" id="sequence" ref={sequenceRef} aria-label="Parcours cinematographique PromptForge">
      <div className="sequence-pin" ref={pinRef}>
        <div className="sequence-stage" aria-hidden="true">
          {chapters.map((chapter, index) => (
            <div
              className={`sequence-video-layer ${index === 0 ? 'is-active' : ''}`}
              key={chapter.id}
              ref={(node) => {
                videoRefs.current[index] = node
              }}
            >
              <VideoLayer
                src={chapter.video}
                title={chapter.title}
                autoPlay={index === 0}
                preload={index <= 2 ? 'metadata' : 'auto'}
                onVideo={(node) => {
                  videoElementRefs.current[index] = node
                }}
              />
            </div>
          ))}
          <div className="cinema-vignette" />
          <div className="letterbox" />
          <div className="film-grain" />
          {chapters.map((chapter, index) => (
            <div
              className="sequence-texture-layer"
              key={`texture-${chapter.id}`}
              ref={(node) => {
                textureRefs.current[index] = node
              }}
            >
              <VideoLayer
                src={chapter.textureVideo}
                title={`${chapter.title} texture`}
                preload="none"
                onVideo={(node) => {
                  textureElementRefs.current[index] = node
                }}
              />
            </div>
          ))}
          <div className="scene-title-ghost">PromptForge Cinematic</div>
          <div className="scene-motion-layer scene-shutter" />
          <div className="scene-motion-layer scene-curtain" />
          <div className="scene-motion-layer scene-soft-wipe" />
          <div className="scene-motion-layer scene-flare" />
          <div className="scene-motion-layer scene-band scene-band-left" />
          <div className="scene-motion-layer scene-band scene-band-right" />
          <div className="scene-motion-layer scene-focus-frame" />
          <div className="scene-motion-layer scene-iris-ring" />
        </div>

        <div className="sequence-ui">
          <nav className="act-nav" aria-label="Progression des actes">
            {chapters.map((chapter, index) => (
              <span
                className={`act-dot ${index === 0 ? 'is-active' : ''}`}
                key={chapter.id}
                ref={(node) => {
                  actRefs.current[index] = node
                }}
              >
                {chapter.act}
              </span>
            ))}
          </nav>

          <div className="sequence-progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>

          <div className="sequence-copy-stage">
            {chapters.map((chapter, index) => (
              <article
                className={`sequence-copy ${index === 0 ? 'is-active' : ''}`}
                key={chapter.id}
                ref={(node) => {
                  copyRefs.current[index] = node
                }}
              >
                <span className="chapter-act">Acte {chapter.act} / {chapter.label}</span>
                <h2>{chapter.title}</h2>
                <p>{chapter.line}</p>
                {chapter.id === 'release' && (
                  <a className="primary-action" href="#final-cta">
                    Voir la sortie
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                )}
              </article>
            ))}
          </div>

          <p className="sequence-caption">Scroll pour monter le film</p>
        </div>
      </div>

      <div className="sequence-spacer" aria-hidden="true" />

      <div className="sequence-mobile" aria-label="Parcours cinematographique mobile">
        {chapters.map((chapter) => (
          <article className="sequence-mobile-card" key={`mobile-${chapter.id}`}>
            <VideoLayer src={chapter.video} title={chapter.title} preload="metadata" />
            <div className="cinema-vignette" />
            <div className="letterbox" />
            <div className="film-grain" />
            <div className="sequence-mobile-content">
              <span className="chapter-act">Acte {chapter.act} / {chapter.label}</span>
              <h2>{chapter.title}</h2>
              <p>{chapter.line}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
