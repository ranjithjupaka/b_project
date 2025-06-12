'use client'

import type React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className='flex min-h-screen flex-col bg-black text-white'>
      <div className='container mx-auto flex h-16 items-center px-4'>
        <Link href='/' className='flex items-center'>
          <div className='flex items-center'>
            <img src='/logo.png' alt='logo' />
            <span className='text-xl font-bold'>Binance Crypto Bot</span>
          </div>
        </Link>
      </div>
      <main className='flex flex-1 items-center justify-center px-4 py-12'>
        <Card className='w-full max-w-md border-gray-800 bg-gray-900 text-white'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>Login</CardTitle>
            <CardDescription className='text-gray-400'>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
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
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='password'>Password</Label>
                  <Link
                    href='/forgot-password'
                    className='text-xs text-blue-500 hover:text-blue-400'
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    className='border-gray-700 bg-gray-800 pl-10 pr-10 text-white placeholder:text-gray-500'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-3 text-gray-500 hover:text-gray-400'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>
              {/* <div className='flex items-center space-x-2'>
                <Checkbox
                  id='remember'
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                />
                <Label htmlFor='remember' className='text-sm text-gray-400'>
                  Remember me for 30 days
                </Label>
              </div> */}
              <Button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-500'
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className='mt-4 flex items-center justify-center'>
              <span className='text-sm text-gray-400'>
                Don&apos;t have an account?
              </span>
              <Link
                href='/register'
                className='ml-1 text-sm text-blue-500 hover:text-blue-400'
              >
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
