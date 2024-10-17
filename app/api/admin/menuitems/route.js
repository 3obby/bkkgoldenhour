import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany();
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Error fetching menu items' }, { status: 500 });
  }
}
