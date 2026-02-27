import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Inter } from 'next/font/google'

import "./auth.css" 
import { ToastContainer } from 'react-toastify';
 
const _geist = Inter({
  subsets: ['latin'],
})
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EezzyMart',
  description: 'EezzyMart',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
