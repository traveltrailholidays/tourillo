'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button' // Adjust import based on your UI library

interface SignOutButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
}

export function SignOutButton({ 
  children, 
  className, 
  variant = 'outline' 
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      })
    } catch (error) {
      console.error('Sign out error:', error)
      // Fallback: force navigation
      window.location.href = '/login'
    }
  }

  return (
    <Button 
      onClick={handleSignOut} 
      className={className}
      variant={variant}
    >
      {children || 'Sign Out'}
    </Button>
  )
}
