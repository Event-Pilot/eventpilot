import * as React from 'react'
import { Link as RouterLink } from 'react-router-dom'

type NextLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
}

const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
  ({ href, children, ...props }, ref) => {
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a ref={ref} href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <RouterLink ref={ref} to={href} {...props}>
      {children}
    </RouterLink>
  )
  },
)

Link.displayName = 'Link'

export default Link
