import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  const body = await request.json();
  const { name, description, price, imageUrl } = body;

  const menuItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      imageUrl,
    },
  });

  return NextResponse.json(menuItem);
}
