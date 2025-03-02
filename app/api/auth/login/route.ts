import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

    try {

        const { username, password } = await req.json()

        const user = await prisma.user.findFirst({
            where: {
                username
            }
        })

        if (!user) return NextResponse.json({ message: "Username tidak ditemukan" }, { status: 404 })

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return NextResponse.json({ message: "Password salah" }, { status: 401 });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET!, { expiresIn: "1h" })

        const response = NextResponse.json({ message: "Login berhasil" });

        console.log(token);
        

        // Simpan token di cookies
        response.cookies.set("token", token, {
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60, // 1 jam
            path: "/",
        });

        return response;

    } catch (error) {

        return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });

    }

}