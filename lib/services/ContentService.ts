import { supabaseAdmin } from '@/lib/config/supabase.config'

export interface SiteContent {
  id: string
  key: string
  value: string
  content_type: string
  section: string
  label: string | null
  created_at: string
  updated_at: string
}

export class ContentService {
  static async getAllContent(): Promise<SiteContent[]> {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('*')
      .order('section', { ascending: true })
      .order('key', { ascending: true })
    if (error) throw new Error(`Failed to fetch content: ${error.message}`)
    return data || []
  }

  static async getContentBySection(section: string): Promise<SiteContent[]> {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('*')
      .eq('section', section)
      .order('key', { ascending: true })
    if (error) throw new Error(`Failed to fetch content: ${error.message}`)
    return data || []
  }

  static async getContentByKey(key: string): Promise<string | null> {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('value')
      .eq('key', key)
      .single()
    if (error) return null
    return data?.value || null
  }

  static async getContentMap(): Promise<Record<string, string>> {
    const content = await this.getAllContent()
    const map: Record<string, string> = {}
    content.forEach(item => { map[item.key] = item.value })
    return map
  }

  static async updateContent(key: string, value: string): Promise<SiteContent> {
    const { data, error } = await supabaseAdmin
      .from('site_content')
      .update({ value })
      .eq('key', key)
      .select()
      .single()
    if (error) throw new Error(`Failed to update content: ${error.message}`)
    return data
  }

  static async bulkUpdateContent(updates: { key: string; value: string }[]): Promise<void> {
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('site_content')
        .update({ value: update.value })
        .eq('key', update.key)
      if (error) throw new Error(`Failed to update ${update.key}: ${error.message}`)
    }
  }
}
