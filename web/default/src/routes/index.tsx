import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const { auth } = useAuthStore.getState()

    throw redirect({ to: auth.user ? '/dashboard' : '/sign-in' })
  },
})
