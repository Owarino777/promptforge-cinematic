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

function VideoLayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="video-shell" aria-hidden="true">
      <div className="video-fallback" />
      <video className="video-media" autoPlay muted playsInline loop preload="metadata">
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

      const activate = (activeIndex: number) => {
        acts.forEach((act, index) => {
          act.classList.toggle('is-active', index === activeIndex)
        })
      }

      gsap.set(videos, { opacity: 0, scale: 1.18, filter: 'brightness(0.48) contrast(1.12) saturate(0.7)' })
      gsap.set(textures, { opacity: 0, scale: 1.1, filter: 'brightness(0.86) contrast(1.3) saturate(0.6)' })
      gsap.set(copies, { opacity: 0, y: 90, filter: 'blur(18px)' })
      gsap.set(progressRef.current, { scaleX: 0.08, transformOrigin: 'left center' })
      gsap.set(videos[0], { opacity: 1, scale: 1.02 })
      gsap.set(copies[0], { opacity: 1, y: 0, filter: 'blur(0px)' })
      activate(0)

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        scrollTrigger: {
          trigger: sequenceRef.current,
          start: 'top top',
          end: `+=${chapters.length * 1450}`,
          pin: pinRef.current,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const revealVideo = (index: number, label: string) => {
        const chapter = chapters[index]
        const isFinal = index === chapters.length - 1

        if (chapter.transition === 'split') {
          gsap.set(videos[index], { xPercent: 10, clipPath: 'inset(0 50% 0 50%)' })
          timeline.to(videos[index], {
            opacity: 1,
            xPercent: 0,
            clipPath: 'inset(0 0% 0 0%)',
            scale: 1.02,
            filter: 'brightness(0.62) contrast(1.18) saturate(0.95)',
            duration: 0.78,
          }, label)
          timeline.to(textures[index], { opacity: 0.34, scale: 1, duration: 0.18, yoyo: true, repeat: 1 }, label)
          return
        }

        if (chapter.transition === 'curtain') {
          gsap.set(videos[index], { yPercent: 18, clipPath: 'inset(100% 0 0 0)' })
          timeline.to(videos[index], {
            opacity: 1,
            yPercent: 0,
            clipPath: 'inset(0% 0 0 0)',
            scale: 1.04,
            filter: 'brightness(0.56) contrast(1.28) saturate(0.78)',
            duration: 0.86,
          }, label)
          timeline.fromTo('.scene-curtain', { scaleY: 0 }, { scaleY: 1, duration: 0.16, yoyo: true, repeat: 1 }, label)
          return
        }

        if (chapter.transition === 'iris') {
          gsap.set(videos[index], { rotate: -2, clipPath: 'circle(0% at 64% 44%)' })
          timeline.to(videos[index], {
            opacity: 1,
            rotate: 0,
            clipPath: 'circle(145% at 50% 50%)',
            scale: 1,
            filter: 'brightness(0.58) contrast(1.25) saturate(0.82)',
            duration: 0.9,
          }, label)
          timeline.to('.scene-iris-ring', { scale: 1.25, opacity: 0.44, duration: 0.24, yoyo: true, repeat: 1 }, label)
          return
        }

        if (chapter.transition === 'exposure') {
          gsap.set(videos[index], { scale: 1.22, filter: 'brightness(0.42) contrast(1.5) saturate(0.7)' })
          timeline.to(textures[index], { opacity: 0.64, scale: 1, duration: 0.38 }, label)
          timeline.to(videos[index], {
            opacity: 1,
            scale: 1.02,
            filter: isFinal ? 'brightness(0.78) contrast(1.08) saturate(1.08)' : 'brightness(0.58) contrast(1.2) saturate(0.9)',
            duration: 0.86,
          }, `${label}+=0.08`)
          timeline.to(textures[index], { opacity: 0, scale: 1.08, duration: 0.44 }, `${label}+=0.42`)
          return
        }

        timeline.to(
          videos[index],
          {
            opacity: 1,
            scale: index % 2 === 0 ? 1.03 : 1,
            filter: isFinal ? 'brightness(0.74) contrast(1.12) saturate(1)' : 'brightness(0.58) contrast(1.2) saturate(0.86)',
            duration: 0.65,
          },
          label,
        )
      }

      chapters.forEach((chapter, index) => {
        const label = chapter.id
        timeline.addLabel(label)
        timeline.call(() => activate(index), [], label)
        timeline.to(progressRef.current, { scaleX: (index + 1) / chapters.length, duration: 0.6 }, label)

        revealVideo(index, label)

        timeline.fromTo(
          '.scene-shutter',
          { scaleX: 0 },
          { scaleX: chapter.transition === 'shutter' && index > 0 ? 1 : 0, duration: 0.12, yoyo: true, repeat: 1 },
          label,
        )

        timeline.to(
          copies[index],
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.62,
          },
          `${label}+=0.08`,
        )

        if (index > 0) {
          const exitDirection = index % 2 === 0 ? -8 : 8
          timeline.to(videos[index - 1], { opacity: 0, scale: 1.14, xPercent: exitDirection, duration: 0.5 }, label)
          timeline.to(copies[index - 1], { opacity: 0, y: -90, filter: 'blur(18px)', duration: 0.38 }, label)
        }

        timeline.to(
          '.scene-title-ghost',
          {
            yPercent: -16 - index * 8,
            opacity: 0.1 + index * 0.025,
            duration: 0.75,
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
              <VideoLayer src={chapter.video} title={chapter.title} />
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
              <VideoLayer src={chapter.textureVideo} title={`${chapter.title} texture`} />
            </div>
          ))}
          <div className="scene-title-ghost">PromptForge Cinematic</div>
          <div className="scene-shutter" />
          <div className="scene-curtain" />
          <div className="scene-iris-ring" />
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
            <VideoLayer src={chapter.video} title={chapter.title} />
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
