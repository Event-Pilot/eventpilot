import Link from 'next/link'
import { Logo } from '@/components/logo'
import { uiCopy } from '@/content/ui-copy'

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.10),transparent_34%),linear-gradient(180deg,#ffffff_0%,#fbfbfa_52%,#f7f6f3_100%)]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label={uiCopy.common.homeAria}>
          <Logo />
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {uiCopy.auth.shell.backHome}
        </Link>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="hidden max-w-xl lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight text-foreground">
              {uiCopy.auth.shell.heading}
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground">
              {uiCopy.auth.shell.description}
            </p>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {uiCopy.auth.shell.chips.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/80 bg-white/70 px-4 py-3 text-sm font-medium text-foreground shadow-[0_18px_60px_rgba(15,23,42,0.05)] backdrop-blur"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="rounded-[1.5rem] border border-border/80 bg-white/82 p-2 shadow-[0_30px_100px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="rounded-[1.1rem] border border-white/70 bg-card px-6 py-7 sm:px-8 sm:py-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
                {children}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
