'use client'

import type React from 'react'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

export default function ResetPasswordPage() {
  // const searchParams = useSearchParams()
  //  const email = searchParams.get('email') || ''
  const email = ''
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()

  // Create individual refs for each OTP input
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtpValues = [...otpValues]
    newOtpValues[index] = value
    setOtpValues(newOtpValues)

    // Combine OTP values
    setOtp(newOtpValues.join(''))

    // Auto focus next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`)
        if (prevInput) {
          prevInput.focus()
        }
      }
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtpValues = [...otpValues]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtpValues[i] = pastedData.charAt(i)
      }
      setOtpValues(newOtpValues)
      setOtp(newOtpValues.join(''))

      // Focus the next empty input or the last one
      const lastFilledIndex = Math.min(pastedData.length - 1, 5)
      const nextInput = document.getElementById(`otp-${lastFilledIndex}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

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

    if (otp.length !== 6) {
      alert('Please enter the complete OTP')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setResetSuccess(true)

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
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
                  href='/forgot-password'
                  className='mr-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-400'
                >
                  <ArrowLeft className='mr-1 h-4 w-4' />
                  Back
                </Link>
              </div>
              <CardTitle className='mt-4 text-2xl font-bold'>
                Reset Password
              </CardTitle>
              <CardDescription className='text-gray-400'>
                Enter the OTP sent to {email || 'your email'} and create a new
                password
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSuccess ? (
                <div className='rounded-lg bg-green-900/20 p-4 text-center'>
                  <h3 className='mb-2 text-lg font-medium text-green-500'>
                    Password Reset Successful!
                  </h3>
                  <p className='text-sm text-gray-300'>
                    Your password has been reset successfully.
                  </p>
                  <p className='mt-2 text-sm text-gray-400'>
                    Redirecting you to login page...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='otp'>Enter OTP</Label>
                    <div className='flex justify-between space-x-2'>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type='text'
                          inputMode='numeric'
                          maxLength={1}
                          className='h-12 w-12 border-gray-700 bg-gray-800 p-0 text-center text-lg font-bold text-white'
                          value={otpValues[index]}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          required
                        />
                      ))}
                    </div>
                    <p className='mt-1 text-xs text-gray-500'>
                      Didn&apos;t receive the code?{' '}
                      <Link
                        href='/forgot-password'
                        className='text-blue-500 hover:text-blue-400'
                      >
                        Resend OTP
                      </Link>
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='password'>New Password</Label>
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
                            className={`h-1 w-full ${getPasswordStrengthColor()} border-white border-0.5`}
                          />
                          <span className='ml-2 text-xs text-gray-400'>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          Use 8+ characters with a mix of letters, numbers &
                          symbols
                        </p>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>
                      Confirm New Password
                    </Label>
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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

                  <Button
                    type='submit'
                    className='w-full bg-blue-600 hover:bg-blue-500'
                    disabled={
                      isLoading ||
                      password !== confirmPassword ||
                      otp.length !== 6
                    }
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
  )
}
