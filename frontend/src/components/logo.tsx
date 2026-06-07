import { cn } from '@/lib/utils'

export function Logo({
  className,
  variant = 'default',
}: {
  className?: string
  variant?: 'default' | 'light'
}) {
  const light = variant === 'light'

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-lg',
          light
            ? 'bg-white text-[#0a0b10] shadow-[0_0_30px_rgba(159,148,255,0.28)]'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11l19-9-9 19-2-8-8-2z" />
        </svg>
      </span>
      <span
        className={cn(
          'text-base font-semibold tracking-tight',
          light ? 'text-white' : 'text-foreground',
        )}
      >
        EventPilot
      </span>
    </span>
  )
}
