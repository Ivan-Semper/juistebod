import { NextRequest, NextResponse } from 'next/server'
import { ContentService } from '@/lib/services/ContentService'

export async function GET() {
  try {
    const allContent = await ContentService.getAllContent()

    const grouped: Record<string, typeof allContent> = {}
    for (const item of allContent) {
      if (!grouped[item.section]) grouped[item.section] = []
      grouped[item.section].push(item)
    }

    return NextResponse.json({ success: true, data: grouped })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { updates } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      )
    }

    await ContentService.bulkUpdateContent(updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
