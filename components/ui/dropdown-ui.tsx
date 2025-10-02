'use client'

import * as React from 'react'
import { ChevronDown, User, Package, Bell, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropdownProps {
  children: React.ReactNode
  trigger: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Dropdown({ 
  children, 
  trigger, 
  align = 'end', 
  side = 'bottom',
  className 
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [dropdownStyle, setDropdownStyle] = React.useState({})
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  // Calculate position to avoid viewport overflow
  const updateDropdownPosition = React.useCallback(() => {
    if (!isOpen || !triggerRef.current || !dropdownRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const dropdownWidth = 224 // w-56 = 14rem = 224px

    let left = 'auto'
    let right = 'auto'
    let transform = ''

    if (align === 'end') {
      // Check if dropdown would overflow on the right
      if (triggerRect.right - dropdownWidth < 0) {
        // If it would overflow, align to left instead
        left = '0px'
      } else {
        right = '0px'
      }
    } else if (align === 'start') {
      // Check if dropdown would overflow on the left
      if (triggerRect.left + dropdownWidth > viewportWidth) {
        right = '0px'
      } else {
        left = '0px'
      }
    }

    setDropdownStyle({ left, right, transform })
  }, [isOpen, align])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update position when opening or resizing
  React.useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      window.addEventListener('resize', updateDropdownPosition)
      return () => window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [isOpen, updateDropdownPosition])

  // Close dropdown when pressing Escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Toggle function
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger wrapper */}
      <div 
        ref={triggerRef}
        className="inline-block"
        onClick={toggleDropdown} // Now toggles instead of just opening
      >
        {trigger}
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div
          className="fixed z-50 w-56 rounded-md border bg-white p-2 shadow-lg animate-in fade-in-0 zoom-in-95"
          style={dropdownStyle}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// Rest of the components remain the same...
interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  disabled?: boolean
  destructive?: boolean
  className?: string
}

export function DropdownItem({ 
  children, 
  disabled, 
  destructive,
  className,
  ...props 
}: DropdownItemProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-gray-100 focus:bg-gray-100',
        disabled && 'pointer-events-none opacity-50',
        destructive && 'text-red-600 hover:bg-red-50 focus:bg-red-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownLabel({ 
  children, 
  className 
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-2 py-1.5 text-sm font-semibold', className)}>
      {children}
    </div>
  )
}

export function DropdownSeparator({ 
  className 
}: { className?: string }) {
  return (
    <div className={cn('my-1 h-px bg-gray-200', className)} />
  )
}