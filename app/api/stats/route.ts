// src/app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get total counts
    const totalJadwal = await prisma.jadwal.count();
    const totalDosen = await prisma.dosen.count();
    const totalKelas = await prisma.kelas.count();
    const totalMataKuliah = await prisma.mataKuliah.count();
    
    // Get distribution by period
    const jadwalByPeriod = await prisma.jadwal.groupBy({
      by: ['period'],
      _count: {
        id: true
      }
    });
    
    // Format period distribution
    const periodDistribution = {
      PAGI: 0,
      SIANG: 0,
      SORE: 0
    };
    
    jadwalByPeriod.forEach(item => {
      if (item.period in periodDistribution) {
        periodDistribution[item.period] = item._count.id;
      }
    });
    
    // Get distribution by day
    const jadwalByDay = await prisma.jadwal.groupBy({
      by: ['hari'],
      _count: {
        id: true
      }
    });
    
    // Format day distribution
    const dayDistribution: Record<string, number> = {
      SENIN: 0,
      SELASA: 0,
      RABU: 0,
      KAMIS: 0,
      JUMAT: 0,
      SABTU: 0
    };
    
    jadwalByDay.forEach(item => {
      if (item.hari in dayDistribution) {
        dayDistribution[item.hari] = item._count.id;
      }
    });
    
    // Get dosen with most classes
    const dosenScheduleCounts = await prisma.jadwal.groupBy({
      by: ['dosen_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    });
    
    let dosenWithMostClasses = {
      nama: '-',
      kode: '-',
      count: 0
    };
    
    if (dosenScheduleCounts.length > 0) {
      const topDosenId = dosenScheduleCounts[0].dosen_id;
      const topDosenCount = dosenScheduleCounts[0]._count.id;
      
      const dosenInfo = await prisma.dosen.findUnique({
        where: {
          id: topDosenId
        }
      });
      
      if (dosenInfo) {
        dosenWithMostClasses = {
          nama: dosenInfo.nama,
          kode: dosenInfo.kode,
          count: topDosenCount
        };
      }
    }
    
    // Get most used classroom
    const kelasScheduleCounts = await prisma.jadwal.groupBy({
      by: ['kelas_id'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    });
    
    let mostUsedClassroom = {
      nama: '-',
      count: 0
    };
    
    if (kelasScheduleCounts.length > 0) {
      const topKelasId = kelasScheduleCounts[0].kelas_id;
      const topKelasCount = kelasScheduleCounts[0]._count.id;
      
      const kelasInfo = await prisma.kelas.findUnique({
        where: {
          id: topKelasId
        }
      });
      
      if (kelasInfo) {
        mostUsedClassroom = {
          nama: kelasInfo.nama,
          count: topKelasCount
        };
      }
    }
    
    // Compile all stats
    const stats = {
      totalJadwal,
      totalDosen,
      totalKelas,
      totalMataKuliah,
      jadwalByPeriod: periodDistribution,
      jadwalByDay: dayDistribution,
      dosenWithMostClasses,
      mostUsedClassroom
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error generating stats:', error);
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    );
  }
}