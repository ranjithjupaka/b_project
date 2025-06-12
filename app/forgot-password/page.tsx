'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false)
      setOtpSent(true)

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 2000)
    }, 1500)
  }

  return (
    <div className='flex min-h-screen flex-col bg-black text-white'>
      <div className='container mx-auto flex h-16 items-center px-4'>
        <Link href='/' className='flex items-center'>
          <img src='/logo.png' alt='logo' />
          <span className='text-xl font-bold'>Binance Crypto Bot</span>
        </Link>
      </div>
      <main className='flex flex-1 items-center justify-center px-4 py-12'>
        <Card className='w-full max-w-md border-gray-800 bg-gray-900 text-white'>
          <CardHeader className='space-y-1'>
            <div className='flex items-center'>
              <Link
                href='/login'
                className='mr-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-400'
              >
                <ArrowLeft className='mr-1 h-4 w-4' />
                Back to login
              </Link>
            </div>
            <CardTitle className='mt-4 text-2xl font-bold'>
              Forgot Password
            </CardTitle>
            <CardDescription className='text-gray-400'>
              Enter your email address and we&apos;ll send you an OTP to reset
              your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otpSent ? (
              <div className='rounded-lg bg-blue-900/20 p-4 text-center'>
                <h3 className='mb-2 text-lg font-medium text-blue-500'>
                  OTP Sent!
                </h3>
                <p className='text-sm text-gray-300'>
                  We&apos;ve sent a one-time password to{' '}
                  <span className='font-medium text-white'>{email}</span>
                </p>
                <p className='mt-2 text-sm text-gray-400'>
                  Redirecting you to reset your password...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email Address</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='name@example.com'
                      className='border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type='submit'
                  className='w-full bg-blue-600 hover:bg-blue-500'
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <p className='text-center text-xs text-gray-500'>
              Make sure to check your spam folder if you don&apos;t see the
              email in your inbox.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
