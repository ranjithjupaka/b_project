import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className='flex min-h-screen flex-col bg-black text-white'>
      <header className='container mx-auto flex h-16 items-center justify-between px-4'>
        <div className='flex items-center'>
          <img src='/logo.png' alt='logo' />
          <span className='text-xl font-bold'>Binance Crypto Bot</span>
        </div>
        <nav className='flex items-center space-x-4'>
          <Link
            href='/login'
            className='text-sm font-medium text-blue-500 hover:text-blue-400'
          >
            Login
          </Link>
          <Button asChild className='bg-blue-600 hover:bg-blue-500'>
            <Link href='/register'>Register</Link>
          </Button>
        </nav>
      </header>
      <main className='container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-12'>
        <div className='text-center'>
          <h1 className='mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
            <span className='text-blue-500'>Automated</span> Crypto Trading
          </h1>
          <p className='mb-8 max-w-2xl text-lg text-gray-400'>
            Trade the top 30 cryptocurrencies with intelligent automation,
            profit tracking, and real-time alerts.
          </p>
          <div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
            <Button asChild size='lg' className='bg-blue-600 hover:bg-blue-500'>
              <Link href='/register'>Get Started</Link>
            </Button>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='border-blue-500 text-blue-500 hover:bg-blue-950 hover:text-white'
            >
              <Link href='/login'>Login to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
