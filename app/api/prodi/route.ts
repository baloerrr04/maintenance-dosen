import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const prodis = await prisma.prodi.findMany()
        return NextResponse.json(prodis, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal mengambil data prodi"}, {status: 500})
    }
}

export async function POST(req: Request) {
    try {
        const {nama} = await req.json()
        const newProdi = await prisma.prodi.create({
            data: {
                nama
            }
        })

        return NextResponse.json(newProdi, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal menambah data prodi"}, {status: 500})
    }
}

export async function PUT(req: Request) {
    try {
        const {id, nama,} = await req.json()

        const updatedProdi = await prisma.prodi.update({
            where: { id },
            data: { nama },
          });
      
          return NextResponse.json(updatedProdi);
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengupdate dosen" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.prodi.delete({ where: { id } });
        return NextResponse.json({ message: "Dosen berhasil dihapus" });
      } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus prodi" }, { status: 500 });
      }
}