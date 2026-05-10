import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Main } from '@/components/layout'
import { Pricing } from '@/features/pricing'

const modelSquareSearchSchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional(),
  vendor: z.string().optional(),
  group: z.string().optional(),
  quotaType: z.string().optional(),
  endpointType: z.string().optional(),
  tag: z.string().optional(),
  tokenUnit: z.enum(['M', 'K']).optional(),
  view: z.enum(['list', 'table']).optional(),
  rechargePrice: z.boolean().optional(),
})

export const Route = createFileRoute('/_authenticated/model-square/')({
  validateSearch: modelSquareSearchSchema,
  component: ModelSquare,
})

function ModelSquare() {
  return (
    <Main className='overflow-auto py-3 sm:py-4'>
      <Pricing
        embedded
        heroMode='compact'
        routeTo='/model-square'
        detailPath='/model-square/$modelId'
      />
    </Main>
  )
}
