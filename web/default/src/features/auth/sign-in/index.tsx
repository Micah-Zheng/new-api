import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()
  const { systemName } = useSystemConfig()

  return (
    <AuthLayout>
      <div className='w-full space-y-6'>
        <div className='space-y-1.5 text-center'>
          <h2 className='text-xl font-semibold tracking-tight text-stone-700'>
            {t('Welcome to sign in')} {systemName}
          </h2>
          {!status?.self_use_mode_enabled && (
            <p className='text-stone-400 text-sm'>
              {t("Don't have an account?")}{' '}
              <Link
                to='/sign-up'
                className='text-stone-500 hover:text-stone-700 font-medium underline underline-offset-4'
              >
                {t('Sign up')}
              </Link>
            </p>
          )}
        </div>

        <UserAuthForm redirectTo={redirect} />

        <TermsFooter
          variant='sign-in'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
