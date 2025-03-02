// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

// Define types for XLSX cell merges
interface CellAddress {
  r: number; // row
  c: number; // column
}

interface CellRange {
  s: CellAddress; // start
  e: CellAddress; // end
}

const prisma = new PrismaClient();

// Define types for better TypeScript support
interface TimeSlot {
  id: string;
  display_text: string;
  period: string;
  day_specific: boolean;
  start_time: string;
  end_time: string;
}

interface Kelas {
  id: string;
  nama: string;
  period: string;
}

interface JadwalEntry {
  id: string;
  hari: string;
  time_slot_id: string;
  kelas_id: string;
  dosen: {
    id: string;
    nama: string;
    kode: string;
  };
  mata_kuliah: {
    id: string;
    nama: string;
    kode: string;
  };
  kelas: Kelas;
  time_slot: TimeSlot;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || 'PAGI';
    
    // 1. Fetch all necessary data for the specified period
    const timeSlots = await prisma.timeSlot.findMany({
      where: { 
        period: period as any 
      },
      orderBy: { start_time: 'asc' }
    });
    
    const kelas = await prisma.kelas.findMany({
      where: { 
        period: period as any 
      },
      orderBy: { nama: 'asc' }
    });
    
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
    
    // 2. Determine available days
    let days: string[];
    if (period === 'SORE') {
      days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    } else {
      days = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
    }
    
    // 3. Create Excel workbook
    const workbook = XLSX.utils.book_new();
    
    // 4. Create headers
    const headers = ['HARI/JAM', ...kelas.map(k => k.nama)];
    
    // 5. Initialize worksheet data with headers
    const wsData = [headers];
    
    // 6. Filter time slots based on day (for the evening period)
    const getTimeSlotsForDay = (day: string): TimeSlot[] => {
      if (period === 'SORE') {
        if (day === 'SABTU') {
          // Get Saturday-specific slots
          return timeSlots.filter(ts => ts.day_specific);
        } else {
          // Get weekday evening slots
          return timeSlots.filter(ts => !ts.day_specific);
        }
      }
      // For morning and afternoon, all time slots apply to all days
      return timeSlots;
    };
    
    // 7. Generate Excel data for each day and time slot
    days.forEach(day => {
      let firstRow = true;
      const dayTimeSlots = getTimeSlotsForDay(day);
      
      dayTimeSlots.forEach(timeSlot => {
        const row = [];
        
        // Add day label on first row of the day
        if (firstRow) {
          row.push(day);
          firstRow = false;
        } else {
          row.push(''); // Empty cell for non-first rows
        }
        
        // Add time slot
        row.push(timeSlot.display_text);
        
        // Add jadwal entries for each kelas
        kelas.forEach(k => {
          const entry = jadwalEntries.find(j => 
            j.hari === day && 
            j.time_slot_id === timeSlot.id && 
            j.kelas_id === k.id
          );
          
          if (entry) {
            row.push(`${entry.mata_kuliah.kode}/${entry.dosen.kode}`);
          } else {
            row.push('');
          }
        });
        
        wsData.push(row);
      });
    });
    
    // 8. Create Excel worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 9. Add cell merges for day labels
    const merges: CellRange[] = [];
    let startRow = 1;
    
    days.forEach(day => {
      const dayTimeSlots = getTimeSlotsForDay(day);
      
      merges.push({
        s: { r: startRow, c: 0 },
        e: { r: startRow + dayTimeSlots.length - 1, c: 0 }
      });
      
      startRow += dayTimeSlots.length;
    });
    
    ws['!merges'] = merges;
    
    // 10. Set column widths
    const colWidths = [
      { wch: 15 },  // HARI/JAM
      { wch: 15 },  // Time slot
      ...kelas.map(() => ({ wch: 12 }))  // Kelas columns
    ];
    
    ws['!cols'] = colWidths;
    
    // 11. Add worksheet to workbook with period-specific name
    let sheetName: string;
    switch(period) {
      case 'PAGI': sheetName = `Jadwal Pagi`; break;
      case 'SIANG': sheetName = `Jadwal Siang`; break;
      case 'SORE': sheetName = `Jadwal Sore`; break;
      default: sheetName = `Jadwal`;
    }
    
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    
    // 12. Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });
    
    // 13. Return Excel file for download
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="jadwal_${period.toLowerCase()}.xlsx"`
      }
    });
  } catch (error) {
    console.error('Error in export API:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file' },
      { status: 500 }
    );
  }
}