import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await prisma.smtpCredential.findMany({
    where: { user: { email: session.user.email } },
  });

  return NextResponse.json(credentials);
}

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { host, port, username, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const credential = await prisma.smtpCredential.create({
    data: {
      host,
      port: parseInt(port),
      username,
      password,
      userId: user.id,
    },
  });

  return NextResponse.json(credential);
}