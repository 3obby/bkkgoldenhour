import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const menus = await prisma.menu.findMany();
  return NextResponse.json(menus);
}

export async function POST(request) {
  const { name } = await request.json();
  const newMenu = await prisma.menu.create({
    data: { name },
  });
  return NextResponse.json(newMenu);
}
