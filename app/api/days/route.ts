// src/app/api/days/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'PAGI';
    
    let days;
    
    if (period === 'SORE') {
      days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    } else {
      days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
    }
    
    return NextResponse.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    return NextResponse.json(
      { error: 'Failed to fetch days' },
      { status: 500 }
    );
  }
}