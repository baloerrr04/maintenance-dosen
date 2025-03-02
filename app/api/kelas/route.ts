import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Check if there's a period query parameter
    const url = new URL(req.url);
    const period = url.searchParams.get('period');
    
    let kelas;
    
    if (period) {
      // If period is provided, filter by it
      kelas = await prisma.kelas.findMany({
        where: {
          period: period as any
        },
        orderBy: {
          nama: 'asc'
        }
      });
    } else {
      // If no period is provided, return all kelas (for backward compatibility)
      kelas = await prisma.kelas.findMany({
        orderBy: {
          nama: 'asc'
        }
      });
    }
    
    return NextResponse.json(kelas, { status: 200 });
  } catch (error) {
    console.error('Error fetching kelas data:', error);
    return NextResponse.json({ error: "Gagal mengambil data kelas" }, { status: 500 });
  }
}



export async function POST(req: Request) {
    try {
        const {nama, period} = await req.json()

        
        const newKelas = await prisma.kelas.create({
            data: {
                nama,
                period
            }
        })

        return NextResponse.json(newKelas, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal menambah data kelas"}, {status: 500})
    }
}

export async function PUT(req: Request) {
    try {
        const {id, nama, period} = await req.json()

        const updatedKelas = await prisma.kelas.update({
            where: { id },
            data: { nama, period },
          });
      
          return NextResponse.json(updatedKelas);
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengupdate kelas" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.kelas.delete({ where: { id } });
        return NextResponse.json({ message: "Kelas berhasil dihapus" });
      } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus kelas" }, { status: 500 });
      }
}