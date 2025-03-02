import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const dosens = await prisma.dosen.findMany()
        return NextResponse.json(dosens, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal mengambil data dosen"}, {status: 500})
    }
}

export async function POST(req: Request) {
    try {
        const {nama, kode} = await req.json()
        const newDosen = await prisma.dosen.create({
            data: {
                nama, kode
            }
        })

        return NextResponse.json(newDosen, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal menambah data dosen"}, {status: 500})
    }
}

export async function PUT(req: Request) {
    try {
        const {id, nama, kode} = await req.json()

        const updatedDosen = await prisma.dosen.update({
            where: { id },
            data: { nama, kode },
          });
      
          return NextResponse.json(updatedDosen);
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengupdate dosen" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.dosen.delete({ where: { id } });
        return NextResponse.json({ message: "Dosen berhasil dihapus" });
      } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus dosen" }, { status: 500 });
      }
}