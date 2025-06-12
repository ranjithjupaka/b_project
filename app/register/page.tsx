'use client'

import type React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
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
import { Progress } from '@/components/ui/progress'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return strength
  }

  const passwordStrength = calculatePasswordStrength(password)

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return 'Weak'
    if (passwordStrength <= 50) return 'Fair'
    if (passwordStrength <= 75) return 'Good'
    return 'Strong'
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500'
    if (passwordStrength <= 50) return 'bg-yellow-500'
    if (passwordStrength <= 75) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Passwords don't match")
      return
    }

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
            <CardTitle className='text-2xl font-bold'>
              Create an account
            </CardTitle>
            <CardDescription className='text-gray-400'>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Full Name</Label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                  <Input
                    id='name'
                    placeholder='John Doe'
                    className='border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
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
                <Label htmlFor='password'>Password</Label>
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
                {password && (
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <Progress
                        value={100 - passwordStrength}
                        className={`h-1 w-full ${getPasswordStrengthColor()}`}
                      />
                      <span className='ml-2 text-xs text-gray-400'>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Use 8+ characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>Confirm Password</Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-3 h-4 w-4 text-gray-500' />
                  <Input
                    id='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    className='border-gray-700 bg-gray-800 pl-10 pr-10 text-white placeholder:text-gray-500'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-3 text-gray-500 hover:text-gray-400'
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className='text-xs text-red-500'>
                    Passwords don&apos;t match
                  </p>
                )}
              </div>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='terms'
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setAgreeTerms(checked as boolean)
                  }
                  required
                />
                <Label htmlFor='terms' className='text-sm text-gray-400'>
                  I agree to the{' '}
                  <Link
                    href='/'
                    className='text-blue-500 hover:text-blue-400'
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href='/'
                    className='text-blue-500 hover:text-blue-400'
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              <Button
                type='submit'
                className='w-full bg-blue-600 hover:bg-blue-500'
                disabled={
                  isLoading || !agreeTerms || password !== confirmPassword
                }
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            <div className='mt-4 flex items-center justify-center'>
              <span className='text-sm text-gray-400'>
                Already have an account?
              </span>
              <Link
                href='/login'
                className='ml-1 text-sm text-blue-500 hover:text-blue-400'
              >
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
