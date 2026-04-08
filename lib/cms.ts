import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface CaseStudy {
  id: string; title: string; eyebrow: string; problem_quote: string;
  what_we_built: string; ai_layer: string; scale_architecture: string;
  status_badge: string; sort_order: number; is_visible: boolean;
}

export interface ResearchCard {
  id: string; tag: string; tag_style: string; title: string;
  subtitle: string; body: string; note: string;
  sort_order: number; is_visible: boolean;
}

export interface TeamMember {
  id: string; name: string; title: string; bio: string;
  credential_label: string; credential_value: string;
  initials: string; photo_url: string;
  sort_order: number; is_visible: boolean;
}

export interface Service {
  id: string; icon: string; title: string; description: string;
  sort_order: number; is_visible: boolean;
}

export async function getCaseStudies(visibleOnly = true): Promise<CaseStudy[]> {
  let q = db().from('bisxp_case_studies').select('*').order('sort_order')
  if (visibleOnly) q = q.eq('is_visible', true)
  const { data } = await q
  return (data as CaseStudy[]) || []
}

export async function getResearchCards(visibleOnly = true): Promise<ResearchCard[]> {
  let q = db().from('bisxp_research_cards').select('*').order('sort_order')
  if (visibleOnly) q = q.eq('is_visible', true)
  const { data } = await q
  return (data as ResearchCard[]) || []
}

export async function getTeamMembers(visibleOnly = true): Promise<TeamMember[]> {
  let q = db().from('bisxp_team_members').select('*').order('sort_order')
  if (visibleOnly) q = q.eq('is_visible', true)
  const { data } = await q
  return (data as TeamMember[]) || []
}

export async function getServices(visibleOnly = true): Promise<Service[]> {
  let q = db().from('bisxp_services').select('*').order('sort_order')
  if (visibleOnly) q = q.eq('is_visible', true)
  const { data } = await q
  return (data as Service[]) || []
}
