// src/app/api/jadwal/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET a specific jadwal entry
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jadwalId = params.id;
    
    const jadwal = await prisma.jadwal.findUnique({
      where: {
        id: jadwalId,
      },
      include: {
        dosen: true,
        mata_kuliah: true,
        kelas: true,
        time_slot: true,
      },
    });
    
    if (!jadwal) {
      return NextResponse.json(
        { error: 'Jadwal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(jadwal);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jadwal' },
      { status: 500 }
    );
  }
}

// UPDATE a jadwal entry
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jadwalId = params.id;
    const {
      dosen_id,
      mata_kuliah_id,
      kelas_id,
      hari,
      time_slot_id,
      period,
    } = await req.json();
    
    // Validate required fields
    if (!dosen_id || !mata_kuliah_id || !kelas_id || !hari || !time_slot_id || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if jadwal exists
    const existingJadwal = await prisma.jadwal.findUnique({
      where: {
        id: jadwalId,
      },
    });
    
    if (!existingJadwal) {
      return NextResponse.json(
        { error: 'Jadwal not found' },
        { status: 404 }
      );
    }
    
    // Update the jadwal
    const updatedJadwal = await prisma.jadwal.update({
      where: {
        id: jadwalId,
      },
      data: {
        dosen_id,
        mata_kuliah_id,
        kelas_id,
        hari: hari as any,
        time_slot_id,
        period: period as any,
      },
      include: {
        dosen: true,
        mata_kuliah: true,
        kelas: true,
        time_slot: true,
      },
    });
    
    return NextResponse.json(updatedJadwal);
  } catch (error: any) {
    console.error('Error updating jadwal:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This schedule would create a conflict' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update jadwal' },
      { status: 500 }
    );
  }
}

// DELETE a jadwal entry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jadwalId = params.id;
    
    // Check if jadwal exists
    const existingJadwal = await prisma.jadwal.findUnique({
      where: {
        id: jadwalId,
      },
    });
    
    if (!existingJadwal) {
      return NextResponse.json(
        { error: 'Jadwal not found' },
        { status: 404 }
      );
    }
    
    // Delete the jadwal
    await prisma.jadwal.delete({
      where: {
        id: jadwalId,
      },
    });
    
    return NextResponse.json(
      { message: 'Jadwal successfully deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    return NextResponse.json(
      { error: 'Failed to delete jadwal' },
      { status: 500 }
    );
  }
}