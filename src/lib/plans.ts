export const PLAN_DETAILS = {
  free: {
    name: 'Free',
    price: 0,
    maxSpaces: 1,
    maxTestimonialsPerSpace: 10,
    embedWidget: true,
    removeBranding: false,
    customCss: false,
    csvImport: false,
    widgetStyles: ['wall', 'badge'],
  },
  starter: {
    name: 'Starter',
    price: 9,
    maxSpaces: 3,
    maxTestimonialsPerSpace: Infinity,
    embedWidget: true,
    removeBranding: true,
    customCss: false,
    csvImport: false,
    widgetStyles: ['wall', 'carousel', 'minimal', 'badge'],
  },
  pro: {
    name: 'Pro',
    price: 29,
    maxSpaces: Infinity,
    maxTestimonialsPerSpace: Infinity,
    embedWidget: true,
    removeBranding: true,
    customCss: true,
    csvImport: true,
    widgetStyles: ['wall', 'carousel', 'minimal', 'badge'],
  },
} as const

export type PlanKey = keyof typeof PLAN_DETAILS

export function getPlan(plan: string): typeof PLAN_DETAILS[PlanKey] {
  return PLAN_DETAILS[plan as PlanKey] || PLAN_DETAILS.free
}

export function canCreateSpace(plan: string, currentSpaceCount: number): boolean {
  const p = getPlan(plan)
  return currentSpaceCount < p.maxSpaces
}

export function canAddTestimonial(plan: string, currentCount: number): boolean {
  const p = getPlan(plan)
  return currentCount < p.maxTestimonialsPerSpace
}
