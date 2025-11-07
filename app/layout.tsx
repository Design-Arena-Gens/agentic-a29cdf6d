import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Credit Card Bill Reminder',
  description: 'Multi-person credit card bill payment reminder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
