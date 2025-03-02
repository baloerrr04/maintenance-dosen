import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

    try {

        const { nama, username, password } = await req.json()

        if (!nama || !username || !password) return NextResponse.json({ message: "Input harus diisi semua" }, { status: 402 })

        const existingUser = await prisma.user.findFirst({
            where: {
                username
            }
        })

        if (existingUser) return NextResponse.json({ message: "Username sudah terdaftar" }, { status: 409 });

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                nama,
                username,
                password: hashedPassword
            }
        })

        // Buat JWT token (opsional, jika ingin login otomatis setelah register)
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });

        return NextResponse.json(
            { message: "Register berhasil", token },
            { status: 201 }
        );


    } catch (error) {

        return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });

    }

}