import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResumeAI by Shambhuraj - Smart AI Resume Builder',
  description: 'Build professional, ATS-friendly resumes effortlessly with ResumeAI. Powered by AI, featuring modern templates and personalized suggestions.',
  keywords: 'resume builder, AI resume, cv maker, professional resume, ATS-friendly, Shambhuraj',
  authors: [{ name: 'Shambhuraj' }],
  creator: 'Shambhuraj',
  publisher: 'ResumeAI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://resumeitnow.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ResumeAI by Shambhuraj - Smart AI Resume Builder',
    description: 'Build professional, ATS-friendly resumes effortlessly with ResumeAI. Powered by AI, featuring modern templates and personalized suggestions.',
    url: 'https://resumeAInow.vercel.app',
    siteName: 'ResumeAI',
    images: [
      {
        url: '/assets/ss.png',
        width: 1200,
        height: 630,
        alt: 'ResumeAI Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeAI by Shambhuraj - Smart AI Resume Builder',
    description: 'Build professional, ATS-friendly resumes effortlessly with ResumeAI. Powered by AI, featuring modern templates and personalized suggestions.',
    images: ['/assets/ss.png'],
    creator: '@shambhuraj',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE', // replace with your code
  },
  category: 'technology',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="google-site-verification" content="YOUR_GOOGLE_SITE_VERIFICATION_CODE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "http://schema.org",
              "@type": "WebApplication",
              "name": "ResumeAI",
              "description": "Build professional, ATS-friendly resumes effortlessly with ResumeAI. Powered by AI, featuring modern templates and personalized suggestions.",
              "url": "https://resumeitnow.vercel.app",
              "applicationCategory": "Resume Builder",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Person",
                "name": "Shambhuraj"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider session={session}>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
