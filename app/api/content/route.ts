import { NextRequest, NextResponse } from 'next/server'
import { ContentService } from '@/lib/services/ContentService'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const contentMap = await ContentService.getContentMap()
    const response = NextResponse.json({ success: true, data: contentMap })
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
    return response
  } catch (error) {
    logger.error('Error fetching content map', { error })
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
