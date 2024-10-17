import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menuItems: true,
      },
    });
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Error fetching menu' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const { menuItemIds } = await request.json();

  try {
    const updatedMenu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        menuItems: {
          set: menuItemIds.map((menuItemId) => ({
            id: menuItemId,
          })),
        },
      },
      include: {
        menuItems: true,
      },
    });
    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Error updating menu' }, { status: 500 });
  }
}
