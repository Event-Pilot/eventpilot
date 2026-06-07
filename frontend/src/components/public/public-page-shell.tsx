import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { cn } from '@/lib/utils'

export function PublicPageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfa] text-foreground">
      <SiteHeader />
      <main
        className={cn(
          'relative isolate flex-1 overflow-hidden',
          'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-80 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,248,246,0))]',
          className,
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}
