import { NextResponse } from 'next/server';
import { BaiduOcrClient } from '@/core/utils/baiduOcr';

export async function POST(request: Request) {
  try {
    const { base64, fileName } = await request.json();

    if (!base64) {
      return NextResponse.json({ error: "Missing base64 file data" }, { status: 400 });
    }

    const client = new BaiduOcrClient();
    const ocrResult = await client.processOcr(base64);

    return NextResponse.json({
      success: true,
      fileName,
      result: ocrResult
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
