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
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Code,
  Copy,
  CreditCard,
  Database,
  Gauge,
  Globe,
  HeartHandshake,
  KeyRound,
  Landmark,
  Route,
  Search,
  Settings,
  ShieldCheck,
  Store,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/assets/logo'
import { cn } from '@/lib/utils'
import { useSystemConfig } from '@/hooks/use-system-config'

interface InkVoyageHomeProps {
  isAuthenticated: boolean
}

interface IconTextItem {
  title: string
  description: string
  icon: LucideIcon
}

const CORE_FEATURES: IconTextItem[] = [
  {
    title: '丰富 API',
    description: '聚合多行业场景',
    icon: Store,
  },
  {
    title: '高可用',
    description: '99.9% 稳定保障',
    icon: ShieldCheck,
  },
  {
    title: '安全可靠',
    description: '多重防护机制',
    icon: ShieldCheck,
  },
  {
    title: '极速响应',
    description: '全球节点加速',
    icon: Zap,
  },
]

const INTEGRATION_STEPS = [
  {
    title: '注册账号',
    description: '创建账号并获取密钥',
    icon: KeyRound,
  },
  {
    title: '选择 API',
    description: '浏览并选择所需 API',
    icon: Search,
  },
  {
    title: '集成开发',
    description: '按文档集成到项目',
    icon: Code,
  },
  {
    title: '上线调用',
    description: '稳定调用，轻松扩展',
    icon: Gauge,
  },
]

const SERVICE_CATEGORIES: IconTextItem[] = [
  {
    title: '金融科技',
    description: '风控、支付、征信',
    icon: Landmark,
  },
  {
    title: '智能出行',
    description: '地图、路径、定位',
    icon: Route,
  },
  {
    title: '电商零售',
    description: '物流、商品、营销',
    icon: CreditCard,
  },
  {
    title: '企业服务',
    description: '数据、通知、效率',
    icon: Building2,
  },
  {
    title: '文娱社交',
    description: '内容、翻译、互动',
    icon: Users,
  },
]

const PLATFORM_METRICS = [
  { value: '50+', label: '上游服务' },
  { value: '100+', label: '模型计费' },
  { value: '50+', label: '兼容路由' },
  { value: '10+', label: '调度策略' },
]

const CODE_SNIPPET = `curl --request GET \\
  --url https://api.newapi.pro/v1/weather \\
  --header 'Authorization: Bearer YOUR_API_KEY' \\
  --header 'Content-Type: application/json' \\
  --data '{"city":"Beijing"}'`

function SealMark() {
  return (
    <span className='inline-grid size-6 place-items-center border border-[#9f3b2f]/45 text-[10px] font-semibold text-[#9f3b2f]'>
      航
    </span>
  )
}

function InkIcon(props: { icon: LucideIcon; className?: string }) {
  const Icon = props.icon

  return (
    <span
      className={cn(
        'relative grid size-15 place-items-center rounded-full bg-[#f7f2e7] text-[#111820] shadow-[inset_0_0_0_1px_rgba(17,24,32,0.12),0_14px_28px_rgba(17,24,32,0.08)]',
        props.className
      )}
    >
      <span className='absolute inset-1 rounded-full border border-[#111820]/10' />
      <span className='absolute -inset-0.5 rounded-full border border-[#c9a45d]/25' />
      <Icon className='relative size-7' strokeWidth={1.8} />
    </span>
  )
}

function HeroSection(props: InkVoyageHomeProps) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const displayName = systemName || '灵枢api'

  return (
    <section className='relative isolate min-h-[680px] overflow-hidden px-4 pt-24 pb-14 sm:px-6 lg:min-h-[720px] lg:pt-28'>
      <div
        aria-hidden='true'
        className='absolute inset-0 -z-10 [background-image:linear-gradient(90deg,#111820_1px,transparent_1px),linear-gradient(180deg,#111820_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_68%)] [background-size:72px_72px] opacity-[0.17]'
      />

      <div className='mx-auto flex max-w-6xl flex-col items-center text-center'>
        <div className='landing-animate-fade-up inline-flex items-center gap-2 rounded-full border border-[#d7c8ac]/80 bg-[#fbf8ef]/74 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#26323a] shadow-[0_12px_36px_rgba(17,24,32,0.08)] backdrop-blur-md'>
          <Logo className='size-4' />
          <span>{displayName}</span>
          <span className='h-3 w-px bg-[#d0bf9f]' />
          <span>{t('稳定 · 高效 · 开放')}</span>
        </div>

        <h1
          aria-label={t('启航你的API之旅')}
          className='landing-animate-fade-up mt-10 max-w-4xl font-serif text-[clamp(3.1rem,13vw,5.25rem)] leading-[1.02] font-semibold tracking-normal text-[#12171a] sm:text-[clamp(3.6rem,8vw,6.5rem)]'
        >
          <span className='block sm:inline'>{t('启航你的')}</span>
          <span className='block sm:inline'>{t('API之旅')}</span>
        </h1>
        <div className='landing-animate-fade-up mt-6 flex items-center justify-center gap-3 text-base font-semibold tracking-[0.4em] text-[#1b252b] md:text-xl'>
          <span>{t('稳定')}</span>
          <span className='h-px w-8 bg-[#b99451]' />
          <span>{t('高效')}</span>
          <span className='h-px w-8 bg-[#b99451]' />
          <span>{t('开放')}</span>
          <SealMark />
        </div>
        <p className='landing-animate-fade-up mx-auto mt-6 max-w-[22rem] px-2 text-sm leading-7 break-words text-[#39464b] md:max-w-2xl md:px-0 md:text-base'>
          {displayName}{' '}
          {t(
            '为开发者提供统一 API 接入、模型调度、密钥管理与用量观测，让每一次请求都像穿越晨雾的航线一样清晰可控。'
          )}
        </p>

        <div className='landing-animate-fade-up mt-12 flex flex-wrap items-center justify-center gap-6'>
          <Link
            to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
            className='group relative inline-flex h-14 items-center justify-center gap-3 bg-transparent px-10 text-base font-bold text-[#111820] transition-all hover:text-[#fbf8ef]'
          >
            <span
              aria-hidden='true'
              className='absolute inset-0 -z-10 bg-[#111820] opacity-10 transition-opacity duration-500 ease-in-out group-hover:opacity-100'
              style={{
                clipPath: 'polygon(3% 5%, 98% 2%, 96% 98%, 1% 95%)',
                borderRadius: '4px 12px 6px 14px',
              }}
            />
            <span
              aria-hidden='true'
              className='absolute inset-0 -z-10 border-2 border-[#111820] opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-0'
              style={{
                clipPath: 'polygon(1% 2%, 99% 4%, 97% 99%, 2% 96%)',
                borderRadius: '12px 4px 14px 6px',
              }}
            />
            {props.isAuthenticated ? t('进入控制台') : t('开始使用')}
            <ArrowRight className='size-5 transition-transform duration-500 ease-out group-hover:translate-x-2' />
          </Link>
        </div>
      </div>
    </section>
  )
}

function MetricsBand() {
  const { t } = useTranslation()

  return (
    <section className='relative px-4 py-8 sm:px-6'>
      <div className='mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-transparent md:grid-cols-4'>
        {PLATFORM_METRICS.map((item) => (
          <div
            key={item.label}
            className='bg-transparent px-5 py-6 text-center text-[#111820]'
          >
            <div className='font-serif text-3xl font-semibold'>
              {item.value}
            </div>
            <div className='mt-1 text-xs font-medium tracking-[0.18em] text-[#667176]'>
              {t(item.label)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CapabilitiesSection() {
  const { t } = useTranslation()

  return (
    <section className='relative overflow-hidden px-4 py-18 sm:px-6 md:py-24'>
      <div className='relative mx-auto max-w-6xl'>
        <div className='text-center'>
          <p className='font-serif text-3xl font-semibold text-[#111820] md:text-4xl'>
            {t('强大能力，触手可及')}
          </p>
          <p className='mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5d686d]'>
            {t(
              '从统一入口到安全治理，从高并发响应到成本透明，把 API 平台能力沉淀成可以反复调用的基础设施。'
            )}
          </p>
        </div>

        <div className='mt-12 grid gap-5 md:grid-cols-4'>
          {CORE_FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className='group relative overflow-hidden rounded-[8px] bg-transparent px-5 py-8 text-center transition-transform duration-300 hover:-translate-y-1'
            >
              <span className='absolute top-3 right-4 font-serif text-4xl text-[#111820]/8'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <InkIcon icon={feature.icon} className='mx-auto' />
              <h3 className='mt-5 font-serif text-lg font-semibold text-[#111820]'>
                {t(feature.title)}
              </h3>
              <p className='mt-2 text-xs tracking-[0.12em] text-[#647076]'>
                {t(feature.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function IntegrationSection() {
  const { t } = useTranslation()

  return (
    <section className='relative overflow-hidden px-4 py-18 sm:px-6 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='text-center'>
          <p className='font-serif text-3xl font-semibold text-[#111820] md:text-4xl'>
            {t('简单四步，快速接入')}
          </p>
        </div>

        <div className='relative mt-14 grid gap-8 md:grid-cols-4'>
          <div
            aria-hidden='true'
            className='absolute top-9 right-[12%] left-[12%] hidden border-t border-dashed border-[#111820]/35 md:block'
          />
          {INTEGRATION_STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className='relative flex flex-col items-center text-center'
              >
                <div className='relative z-10 grid size-18 place-items-center rounded-full bg-[#111820] text-white shadow-[0_12px_30px_rgba(17,24,32,0.18)]'>
                  <span className='font-serif text-2xl font-semibold'>
                    {index + 1}
                  </span>
                  <Icon className='absolute -right-2 -bottom-2 size-7 rounded-full border border-[#d8c8ab] bg-[#fbf8ef] p-1.5 text-[#111820]' />
                </div>
                <h3 className='mt-5 font-serif text-lg font-semibold text-[#111820]'>
                  {t(step.title)}
                </h3>
                <p className='mt-2 max-w-[190px] text-xs leading-6 text-[#647076]'>
                  {t(step.description)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CodeShowcaseSection() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CODE_SNIPPET)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <section className='relative overflow-hidden px-4 py-18 sm:px-6 md:py-24'>
      <div className='relative mx-auto max-w-6xl'>
        <div className='grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]'>
          <div>
            <p className='font-serif text-3xl font-semibold text-[#111820] md:text-4xl'>
              {t('一行代码，轻松调用')}
            </p>
            <p className='mt-4 max-w-xl text-sm leading-7 text-[#5d686d]'>
              {t(
                '沿用熟悉的 REST 调用习惯，使用统一鉴权、统一日志和统一计费，把复杂上游差异收束在平台内部。'
              )}
            </p>
            <div className='mt-8 grid grid-cols-2 gap-3 text-sm text-[#111820] sm:grid-cols-3'>
              {['cURL', 'Python', 'JavaScript', 'PHP', 'Go', 'SDK'].map(
                (label) => (
                  <span
                    key={label}
                    className='rounded-[8px] border border-[#d8c8ab] bg-[#fbf8ef]/76 px-4 py-3 font-semibold'
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>

          <div className='overflow-hidden rounded-[8px] border border-[#111820]/20 bg-[#10171b] shadow-[0_24px_56px_rgba(17,24,32,0.28)]'>
            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
              <div className='flex items-center gap-2'>
                <span className='size-2.5 rounded-full bg-[#b84b3d]' />
                <span className='size-2.5 rounded-full bg-[#c9a45d]' />
                <span className='size-2.5 rounded-full bg-[#74856b]' />
              </div>
              <button
                type='button'
                onClick={handleCopy}
                className='inline-flex h-8 items-center gap-2 rounded-[8px] border border-white/12 px-3 text-xs font-semibold text-white/82 transition-colors hover:bg-white/8'
              >
                {copied ? (
                  <Check className='size-3.5' />
                ) : (
                  <Copy className='size-3.5' />
                )}
                {copied ? t('已复制') : t('复制')}
              </button>
            </div>
            <pre className='overflow-x-auto px-5 py-6 text-left text-sm leading-7 text-[#d7ded9]'>
              <code>
                <span className='text-[#c9a45d]'>curl</span>
                {CODE_SNIPPET.replace('curl', '')}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServiceSection() {
  const { t } = useTranslation()

  return (
    <section className='relative overflow-hidden px-4 py-18 sm:px-6 md:py-24'>
      <div className='mx-auto max-w-6xl'>
        <div className='text-center'>
          <p className='font-serif text-3xl font-semibold text-[#111820] md:text-4xl'>
            {t('赋能千行百业')}
          </p>
          <p className='mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#5d686d]'>
            {t('把复杂能力封装成稳定接口，让业务系统在不同场景下快速启航。')}
          </p>
        </div>

        <div className='mt-12 grid gap-4 md:grid-cols-5'>
          {SERVICE_CATEGORIES.map((category) => (
            <div
              key={category.title}
              className='rounded-[8px] bg-transparent p-5 text-center transition-colors'
            >
              <InkIcon icon={category.icon} className='mx-auto size-13' />
              <h3 className='mt-4 font-serif text-base font-semibold text-[#111820]'>
                {t(category.title)}
              </h3>
              <p className='mt-2 text-xs leading-5 text-[#647076]'>
                {t(category.description)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FutureCtaSection(props: InkVoyageHomeProps) {
  const { t } = useTranslation()

  return (
    <section className='relative overflow-hidden px-4 py-20 sm:px-6 md:py-28'>
      <div className='relative mx-auto max-w-4xl text-center'>
        <p className='font-serif text-4xl leading-tight font-semibold text-[#111820] md:text-5xl'>
          {t('启航未来，探索无限可能')}
        </p>
        <p className='mx-auto mt-4 max-w-xl text-sm leading-7 text-[#4d5a5f]'>
          {t('加入我们，连接未来，创造价值。')}
        </p>
        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Link
            to={props.isAuthenticated ? '/dashboard' : '/sign-up'}
            className='inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#111820] px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5'
          >
            {props.isAuthenticated ? t('进入控制台') : t('立即注册')}
            <ArrowRight className='size-4' />
          </Link>
          <a
            href='https://docs.newapi.pro/getting-started/'
            target='_blank'
            rel='noreferrer'
            className='inline-flex h-11 items-center justify-center rounded-[8px] border border-[#111820]/24 bg-[#fbf8ef]/72 px-6 text-sm font-semibold text-[#111820] backdrop-blur-sm hover:bg-white/80'
          >
            {t('探索文档')}
          </a>
        </div>
      </div>
    </section>
  )
}

function PlatformStrengths() {
  const { t } = useTranslation()
  const strengths: IconTextItem[] = [
    {
      title: '全链路观测',
      description: '用量、延迟、成本与异常在同一视图中汇总',
      icon: Activity,
    },
    {
      title: '策略化调度',
      description: '按模型、分组、渠道和状态分配请求路径',
      icon: Settings,
    },
    {
      title: '数据化运营',
      description: '统计报表帮助团队看清增长与资源消耗',
      icon: BarChart3,
    },
    {
      title: '开放生态',
      description: '兼容主流接口形式，面向自托管场景扩展',
      icon: Globe,
    },
    {
      title: '可信协作',
      description: '团队权限、令牌与额度协同管理',
      icon: HeartHandshake,
    },
    {
      title: '统一数据',
      description: '渠道、模型、账单与日志统一沉淀',
      icon: Database,
    },
  ]

  return (
    <section className='relative overflow-hidden px-4 py-18 sm:px-6 md:py-24'>
      <div className='relative mx-auto max-w-6xl'>
        <div className='grid gap-4 md:grid-cols-3'>
          {strengths.map((strength) => {
            const Icon = strength.icon
            return (
              <div
                key={strength.title}
                className='rounded-[8px] bg-transparent p-6'
              >
                <Icon className='size-7 text-[#111820]' strokeWidth={1.6} />
                <h3 className='mt-4 font-serif text-lg font-semibold text-[#111820]'>
                  {t(strength.title)}
                </h3>
                <p className='mt-2 text-sm leading-7 text-[#647076]'>
                  {t(strength.description)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function GroupBackground(props: { src: string }) {
  return (
    <img
      src={props.src}
      alt=''
      aria-hidden='true'
      className='absolute inset-0 h-full w-full object-cover opacity-85'
    />
  )
}

function GroupFade() {
  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#f7f1e6]'
    />
  )
}

export function InkVoyageHome(props: InkVoyageHomeProps) {
  return (
    <main className='relative overflow-hidden bg-[#f7f1e6] text-[#111820]'>
      <div className='relative'>
        <GroupBackground src='/灵枢api-1.jpg' />
        <div className='relative'>
          <HeroSection isAuthenticated={props.isAuthenticated} />
          <MetricsBand />
        </div>
        <GroupFade />
      </div>

      <div className='relative'>
        <GroupBackground src='/灵枢api-2.jpg' />
        <div className='relative'>
          <PlatformStrengths />
          <CapabilitiesSection />
        </div>
        <GroupFade />
      </div>

      <div className='relative'>
        <GroupBackground src='/灵枢api-3.jpg' />
        <div className='relative'>
          <IntegrationSection />
          <CodeShowcaseSection />
        </div>
        <GroupFade />
      </div>

      <div className='relative'>
        <GroupBackground src='/灵枢api-4.jpg' />
        <div className='relative'>
          <ServiceSection />
          <FutureCtaSection isAuthenticated={props.isAuthenticated} />
        </div>
      </div>
    </main>
  )
}
