import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
    try {
        const matkuls = await prisma.mataKuliah.findMany()
        return NextResponse.json(matkuls, {status: 200})
    } catch (erro) {
        return NextResponse.json({error: "Gagal mengambil data matkul"}, {status: 500})
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nama, sks, jam, kode, semester, prodi_id } = body;

        if (!nama || !sks || !jam || !kode || !prodi_id) {
            return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
        }

        const newMatkul = await prisma.mataKuliah.create({
            data: { nama, sks: Number(sks), jam: Number(jam), kode, semester: Number(semester), prodi_id: prodi_id},
        }) as Prisma.MataKuliahUncheckedCreateInput;

        return NextResponse.json(newMatkul, { status: 200 });
    } catch (error) {
        console.error("Error adding mata kuliah:", error);
        return NextResponse.json({ error: "Gagal menambah data matkul" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const {id, nama, sks, jam, kode, semester, prodi_id} = await req.json()

        const updatedMatkul = await prisma.mataKuliah.update({
            where: { id },
            data: { nama, sks, jam, kode, semester, prodi_id},
          });
      
          return NextResponse.json(updatedMatkul);
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengupdate matkul" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.mataKuliah.delete({ where: { id } });
        return NextResponse.json({ message: "Matkul berhasil dihapus" });
      } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus matkul" }, { status: 500 });
      }
}