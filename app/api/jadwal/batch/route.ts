// src/app/api/jadwal/batch/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Get data from request body
    const { 
      dosen_id, 
      mata_kuliah_id, 
      kelas_id, 
      hari, 
      time_slot_ids, 
      period 
    } = await req.json();
    
    // Validate request
    if (!dosen_id || !mata_kuliah_id || !kelas_id || !hari || !time_slot_ids || !period) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(time_slot_ids) || time_slot_ids.length === 0) {
      return NextResponse.json(
        { error: 'time_slot_ids must be a non-empty array' },
        { status: 400 }
      );
    }
    
    // Check for conflicts first
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
    
    // If conflicts found, return error
    if (dosenConflicts.length > 0 || kelasConflicts.length > 0) {
      const conflicts = [
        ...dosenConflicts.map(conflict => ({
          type: 'dosen',
          time_slot_id: conflict.time_slot_id,
          time_slot_display: conflict.time_slot.display_text,
          kelas_id: conflict.kelas_id,
          kelas_nama: conflict.kelas.nama
        })),
        ...kelasConflicts.map(conflict => ({
          type: 'kelas',
          time_slot_id: conflict.time_slot_id,
          time_slot_display: conflict.time_slot.display_text,
          dosen_id: conflict.dosen_id,
          dosen_nama: conflict.dosen.nama,
          dosen_kode: conflict.dosen.kode
        }))
      ];
      
      return NextResponse.json(
        { 
          error: 'Conflict detected', 
          conflicts 
        },
        { status: 409 }
      );
    }
    
    // Create multiple jadwal entries in a transaction
    const createdEntries = await prisma.$transaction(
      time_slot_ids.map(time_slot_id => 
        prisma.jadwal.create({
          data: {
            dosen_id,
            mata_kuliah_id,
            kelas_id,
            hari: hari as any,
            time_slot_id,
            period: period as any
          }
        })
      )
    );
    
    // Return success response
    return NextResponse.json({
      message: `Successfully created ${createdEntries.length} schedule entries`,
      count: createdEntries.length,
      entries: createdEntries
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating batch jadwal:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'One or more schedule entries would create a conflict' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create batch jadwal', details: error.message },
      { status: 500 }
    );
  }
}