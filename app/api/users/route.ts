import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {

    const token = req.cookies.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {payload} = await jwtVerify(token, secretKey);
    const loggedInUserId = payload.id

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {
                    not: String(loggedInUserId)
                }
            }
        })
        return NextResponse.json(users, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal mengambil data users"}, {status: 500})
    }
}

export async function POST(req: Request) {
    try {
        const {nama, username, password} = await req.json()

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                nama,
                username,
                password: hashedPassword
            }
        })

        return NextResponse.json(newUser, {status: 200})
    } catch (error) {
        return NextResponse.json({error: "Gagal menambah data users"}, {status: 500})
    }
}

export async function PUT(req: Request) {
    try {
        const { id, nama, username, password } = await req.json();

        // Ambil data user lama
        const existingUser = await prisma.user.findUnique({
            where: { id },
            select: { password: true }, // Hanya ambil password lama
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
        }

        // Jika password kosong, gunakan password lama
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                nama,
                username,
                password: password || existingUser.password, // Gunakan password lama jika kosong
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengupdate dosen" }, { status: 500 });
    }
}


export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ message: "Dosen berhasil dihapus" });
      } catch (error) {
        return NextResponse.json({ error: "Gagal menghapus users" }, { status: 500 });
      }
}