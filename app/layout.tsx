import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AI Analytics Agent',
    description: 'Self-service analytics for non-technical users.',
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
