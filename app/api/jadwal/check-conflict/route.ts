// src/app/api/jadwal/check-conflict/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { dosen_id, kelas_id, hari, time_slot_id, period } = await req.json();
    
    // Check if required fields are missing
    if (!dosen_id || !kelas_id || !hari || !time_slot_id || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check for dosen conflicts (same dosen scheduled at the same time on the same day)
    const dosenConflicts = await prisma.jadwal.findMany({
      where: {
        dosen_id,
        hari: hari as any,
        time_slot_id,
        kelas_id: { not: kelas_id } // Exclude the current kelas
      },
      include: {
        kelas: true
      }
    });
    
    // Check for kelas conflicts (same kelas being used at the same time on the same day)
    const kelasConflicts = await prisma.jadwal.findMany({
      where: {
        kelas_id,
        hari: hari as any,
        time_slot_id,
        dosen_id: { not: dosen_id } // Exclude the current dosen
      },
      include: {
        dosen: true
      }
    });
    
    const conflicts = [
      ...dosenConflicts.map(conflict => ({
        type: 'dosen',
        jadwal_id: conflict.id,
        kelas_id: conflict.kelas_id,
        kelas_nama: conflict.kelas.nama
      })),
      ...kelasConflicts.map(conflict => ({
        type: 'kelas',
        jadwal_id: conflict.id,
        dosen_id: conflict.dosen_id,
        dosen_nama: conflict.dosen.nama,
        dosen_kode: conflict.dosen.kode
      }))
    ];
    
    // Get related entities data for UI display
    const entities = {
      dosen: conflicts.length > 0 ? 
        await prisma.dosen.findMany({
          where: { id: { in: [dosen_id] } }
        }) : [],
      kelas: conflicts.length > 0 ? 
        await prisma.kelas.findMany({
          where: { id: { in: [kelas_id] } }
        }) : []
    };
    
    return NextResponse.json({
      conflicts,
      entities
    });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check conflicts' },
      { status: 500 }
    );
  }
}