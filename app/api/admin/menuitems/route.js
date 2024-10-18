import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let menuItems;

    if (category) {
      menuItems = await prisma.menuItem.findMany({
        where: {
          menuItemCategories: {
            some: {
              category: {
                name: category,
              },
            },
          },
        },
        include: {
          menuItemCategories: {
            include: { category: true },
          },
        },
      });
    } else {
      menuItems = await prisma.menuItem.findMany({
        include: {
          menuItemCategories: {
            include: { category: true },
          },
        },
      });
    }

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Error fetching menu items' }, { status: 500 });
  }
}
