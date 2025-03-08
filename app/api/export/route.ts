// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

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
    
    // 3. Create workbook
    const workbook = XLSX.utils.book_new();
    
    // 4. Group time slots into before/after break
    // This is a simplified approach - adjust based on your actual break timing
    const groupTimeSlots = () => {
      const beforeBreak: typeof timeSlots = [];
      const afterBreak: typeof timeSlots = [];
      
      for (const slot of timeSlots) {
        const hour = parseInt(slot.start_time.split(':')[0]);
        if (hour < 10) {
          beforeBreak.push(slot);
        } else {
          afterBreak.push(slot);
        }
      }
      
      return { beforeBreak, afterBreak };
    };
    
    const { beforeBreak, afterBreak } = groupTimeSlots();
    
    // 5. Create worksheet data structure
    // First row: HARI/JAM and class names
    const headers = ['HARI/JAM', ...kelas.map(k => k.nama)];
    const wsData = [];
    
    // Create the headers row
    wsData.push(headers);
    
    // Process each day
    for (const day of days) {
      // Create a day header row
      const dayRow = [day];
      // Add empty cells for each kelas
      for (let i = 0; i < kelas.length; i++) {
        dayRow.push('');
      }
      wsData.push(dayRow);
      
      // Add morning time slots
      for (const timeSlot of beforeBreak) {
        const row = [timeSlot.display_text];
        
        // Add cells for each kelas
        for (const k of kelas) {
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
        }
        
        wsData.push(row);
      }
      
      // Add BREAK row if we have both morning and afternoon sessions
      if (beforeBreak.length > 0 && afterBreak.length > 0) {
        const breakRow = ['BREAK'];
        // Add empty cells for each kelas
        for (let i = 0; i < kelas.length; i++) {
          breakRow.push('');
        }
        wsData.push(breakRow);
      }
      
      // Add afternoon time slots
      for (const timeSlot of afterBreak) {
        const row = [timeSlot.display_text];
        
        // Add cells for each kelas
        for (const k of kelas) {
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
        }
        
        wsData.push(row);
      }
      
      // Add an empty row as separator between days (except for the last day)
      if (day !== days[days.length - 1]) {
        wsData.push(Array(kelas.length + 1).fill(''));
      }
    }
    
    // 6. Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // 7. Apply styling
    if (!ws['!ref']) {
      ws['!ref'] = "A1";
    }
    
    const range = XLSX.utils.decode_range(ws['!ref']);
    
    // Create merges array for styling
    const merges = [];
    
    // Handle day header merges (colspan)
    let rowIndex = 1; // Start after the header row (0-indexed)
    
    for (const day of days) {
      // Day headers need colspans
      merges.push({
        s: { r: rowIndex, c: 0 },    // Start: beginning of row at column 0
        e: { r: rowIndex, c: kelas.length }  // End: same row, last column
      });
      
      // Count time slots for this day (accounting for break row if needed)
      const timeSlotCount = beforeBreak.length + afterBreak.length + 
        (beforeBreak.length > 0 && afterBreak.length > 0 ? 1 : 0);
      
      // Move to the next day's starting row (+1 for empty separator row, except for last day)
      rowIndex += timeSlotCount + (day !== days[days.length - 1] ? 1 : 0);
      
      // Move to next row for next day's header
      rowIndex += 1;
    }
    
    // Apply merges to worksheet
    ws['!merges'] = merges;
    
    // 8. Apply styles (using cell properties)
    // Create empty !cols array if it doesn't exist
    ws['!cols'] = ws['!cols'] || [];
    
    // Set width for HARI/JAM column
    ws['!cols'][0] = { wch: 15 };
    
    // Set width for kelas columns
    for (let i = 0; i < kelas.length; i++) {
      ws['!cols'][i + 1] = { wch: 12 };
    }
    
    // 9. Apply coloring for day headers and BREAK rows
    // Note: We need to manually set cell styles for each cell
    // Using an approximation with cell formatting
    
    // Helper to get cell address
    const getCellAddress = (r: number, c: number) => XLSX.utils.encode_cell({r, c});
    
    // Format day headers
    for (let i = 0; i < days.length; i++) {
      const rowNum = 1 + (i * (beforeBreak.length + afterBreak.length + 
        (beforeBreak.length > 0 && afterBreak.length > 0 ? 1 : 0) + 
        (i < days.length - 1 ? 1 : 0)));
      
      // Format all cells in the day header row
      for (let colNum = 0; colNum <= kelas.length; colNum++) {
        const cellAddr = getCellAddress(rowNum, colNum);
        if (!ws[cellAddr]) continue;
        
        ws[cellAddr].s = {
          fill: { fgColor: { rgb: "E0E0E0" } }, // Light gray
          font: { bold: true }
        };
      }
    }
    
    // Format header row
    for (let colNum = 0; colNum <= kelas.length; colNum++) {
      const cellAddr = getCellAddress(0, colNum);
      if (!ws[cellAddr]) continue;
      
      ws[cellAddr].s = {
        fill: { fgColor: { rgb: "F0F0F0" } }, // Lighter gray
        font: { bold: true }
      };
    }
    
    // 10. Add worksheet to workbook
    let sheetName: string;
    switch(period) {
      case 'PAGI': sheetName = `Jadwal Pagi`; break;
      case 'SIANG': sheetName = `Jadwal Siang`; break;
      case 'SORE': sheetName = `Jadwal Sore`; break;
      default: sheetName = `Jadwal`;
    }
    
    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    
    // 11. Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });
    
    // 12. Return Excel file for download
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="jadwal_${period.toLowerCase()}.xlsx"`
      }
    });
  } catch (error:any) {
    console.error('Error generating Excel:', error);
    return NextResponse.json(
      { error: 'Failed to generate Excel file', details: error.message },
      { status: 500 }
    );
  }
}