type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative grid min-h-svh max-w-none overflow-hidden bg-stone-100'>
      <div
        aria-hidden
        className='absolute inset-0 bg-center bg-cover bg-no-repeat'
        style={{ backgroundImage: "url('/login-background.png')" }}
      />
      <div className='relative z-10 flex min-h-svh items-center justify-center px-4 py-8 sm:px-8 lg:justify-end lg:pr-[8vw]'>
        <div className='flex w-full max-w-[440px] flex-col justify-center space-y-2 rounded-2xl bg-white/90 px-10 py-10 shadow-lg shadow-black/8 backdrop-blur-sm'>
          {children}
        </div>
      </div>
    </div>
  )
}
