import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

const IMAGE_PATHS: Record<string, string> = {
  hero_1: 'public/landing_page_photos/artists-eyes-tHV0jeh_Yd4-unsplash.jpg',
  hero_2: 'public/landing_page_photos/anya-chernik-LXHbMXfFrhw-unsplash.jpg',
  logo_front: 'public/Juistebod logo voorkant.png',
  logo_top: 'public/Juiste bod logo boven.png',
  contact_photo: 'public/images/Netraam_foto.jpeg',
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const imageId = formData.get('imageId') as string | null

    if (!file || !imageId) {
      return NextResponse.json(
        { success: false, error: 'File and imageId are required' },
        { status: 400 }
      )
    }

    const targetPath = IMAGE_PATHS[imageId]
    if (!targetPath) {
      return NextResponse.json(
        { success: false, error: 'Unknown image ID' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fullPath = path.join(process.cwd(), targetPath)

    await writeFile(fullPath, buffer)

    return NextResponse.json({ success: true, path: targetPath })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    )
  }
}
