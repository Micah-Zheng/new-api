/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='relative flex min-h-svh items-center justify-center overflow-hidden font-sans text-[#111820]'>
      <div
        className='absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-[0.85]'
        style={{ backgroundImage: 'url(/login-bg.jpg)' }}
      />
      <div aria-hidden='true' className='absolute inset-0 -z-10 bg-white/30' />
      <Link
        to='/'
        className='absolute top-4 left-4 z-10 flex items-center gap-3 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover shadow-sm'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='font-serif text-xl font-bold tracking-wider text-[#111820] drop-shadow-sm'>
            {systemName}
          </h1>
        )}
      </Link>
      <div className='relative z-10 container mx-auto flex w-full items-center justify-center px-4 pt-16 sm:px-0 sm:pt-0'>
        <div className='relative w-full max-w-[420px] sm:w-[480px]'>
          <div className='absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#c9a45d]/40 via-transparent to-[#111820]/30 opacity-70 blur-md' />
          <div className='relative mx-auto flex w-full flex-col justify-center space-y-6 rounded-[16px] border border-[#d8c8ab]/60 bg-[#fbf8ef]/85 px-6 py-10 shadow-[0_24px_56px_rgba(17,24,32,0.12)] backdrop-blur-md sm:p-10'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
