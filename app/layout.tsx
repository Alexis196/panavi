import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NavigationLoader from '@/components/ui/NavigationLoader'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Panavi - Panadería Artesanal | Formosa, Argentina',
  description: 'Panadería artesanal en Formosa. Pan, facturas, tortas y más elaborados con ingredientes seleccionados.',
  keywords: 'panadería, artesanal, Formosa, Argentina, pan, facturas, tortas',
  icons: {
    icon: [
      { url: '/iconW.webp', media: '(prefers-color-scheme: light)' },
      { url: '/iconB.webp', media: '(prefers-color-scheme: dark)' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-full antialiased`}>
        <NavigationLoader />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#3E3124',
              color: '#E7D7B1',
              border: '1px solid #C97B4B',
            },
            success: {
              iconTheme: { primary: '#D4A65A', secondary: '#3E3124' },
            },
          }}
        />
      </body>
    </html>
  )
}
