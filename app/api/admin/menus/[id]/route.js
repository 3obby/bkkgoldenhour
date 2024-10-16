import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params;
  const menu = await prisma.menu.findUnique({
    where: { id: parseInt(id) },
  });
  return NextResponse.json(menu);
}
