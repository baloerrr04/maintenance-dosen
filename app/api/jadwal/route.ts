import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'PAGI';
    
    const jadwalEntries = await prisma.jadwal.findMany({
      where: {
        period: period as any
      },
      include: {
        dosen: true,
        mata_kuliah: true,
        kelas: true,
        time_slot: true
      },
      orderBy: [
        { hari: 'asc' },
        { time_slot: { start_time: 'asc' } }
      ]
    });
    
    return NextResponse.json(jadwalEntries);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jadwal' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['dosen_id', 'mata_kuliah_id', 'kelas_id', 'hari', 'time_slot_id', 'period'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create jadwal entry
    const jadwal = await prisma.jadwal.create({
      data: {
        dosen_id: data.dosen_id,
        mata_kuliah_id: data.mata_kuliah_id,
        kelas_id: data.kelas_id,
        hari: data.hari as any,
        time_slot_id: data.time_slot_id,
        period: data.period as any
      },
      include: {
        dosen: true,
        mata_kuliah: true,
        kelas: true,
        time_slot: true
      }
    });
    
    return NextResponse.json(jadwal);
  } catch (error: any) {
    console.error('Error creating jadwal:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Jadwal conflict detected' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create jadwal' },
      { status: 500 }
    );
  }
}