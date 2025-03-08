// src/app/api/jadwal/check-conflict-multi/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { dosen_id, kelas_id, hari, time_slot_ids, period } = await req.json();
    
    // Check if required fields are missing
    if (!dosen_id || !kelas_id || !hari || !time_slot_ids || !Array.isArray(time_slot_ids) || !period) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }
    
    // Retrieve time slot details for reporting
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        id: { in: time_slot_ids }
      }
    });
    
    // Check for dosen conflicts (same dosen scheduled at the same time slots on the same day)
    const dosenConflicts = await prisma.jadwal.findMany({
      where: {
        dosen_id,
        hari: hari as any,
        time_slot_id: { in: time_slot_ids },
        kelas_id: { not: kelas_id } // Exclude the current kelas
      },
      include: {
        kelas: true,
        time_slot: true
      }
    });
    
    // Check for kelas conflicts (same kelas being used at the same time slots on the same day)
    const kelasConflicts = await prisma.jadwal.findMany({
      where: {
        kelas_id,
        hari: hari as any,
        time_slot_id: { in: time_slot_ids },
        dosen_id: { not: dosen_id } // Exclude the current dosen
      },
      include: {
        dosen: true,
        time_slot: true
      }
    });
    
    // Format conflicts for easy consumption by the frontend
    const conflicts = [
      ...dosenConflicts.map(conflict => ({
        type: 'dosen',
        jadwal_id: conflict.id,
        time_slot_id: conflict.time_slot_id,
        kelas_id: conflict.kelas_id,
        kelas_nama: conflict.kelas.nama
      })),
      ...kelasConflicts.map(conflict => ({
        type: 'kelas',
        jadwal_id: conflict.id,
        time_slot_id: conflict.time_slot_id,
        dosen_id: conflict.dosen_id,
        dosen_nama: conflict.dosen.nama,
        dosen_kode: conflict.dosen.kode
      }))
    ];
    
    // Get related entities data for UI display
    const dosen = conflicts.length > 0 ? 
      await prisma.dosen.findMany({
        where: { id: { in: [dosen_id] } }
      }) : [];
      
    const kelas = conflicts.length > 0 ? 
      await prisma.kelas.findMany({
        where: { id: { in: [kelas_id] } }
      }) : [];
    
    // Send the response with conflicts and entity data
    return NextResponse.json({
      conflicts,
      entities: {
        dosen,
        kelas,
        time_slots: timeSlots
      }
    });
  } catch (error: any) {
    console.error('Error checking conflicts:', error);
    return NextResponse.json(
      { error: 'Failed to check conflicts', message: error.message },
      { status: 500 }
    );
  }
}