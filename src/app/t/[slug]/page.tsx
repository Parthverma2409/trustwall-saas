import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import TestimonialForm from './TestimonialForm'

export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const space = await db.space.findUnique({ where: { slug: params.slug } })
  if (!space) return { title: 'Not Found' }
  return {
    title: `Share your feedback — ${space.name}`,
    description: `Leave a testimonial for ${space.name}`,
  }
}

export default async function TestimonialPage({ params }: Props) {
  const space = await db.space.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      logo: true,
      primaryColor: true,
      thankYouMsg: true,
      thankYouRedirect: true,
    },
  })

  if (!space) notFound()

  // Track page view (fire-and-forget)
  db.space.update({
    where: { id: space.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  return <TestimonialForm space={space} />
}
