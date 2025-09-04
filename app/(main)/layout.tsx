import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <>
        <Navbar />
        <Toaster />
        {children}
        <Footer />
    </>
  )
}