import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: parseInt(id) },
      include: {
        menuItemsOnMenu: {
          include: {
            menuItem: true
          }
        }
      },
    });

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    // Transform the data to match the expected structure
    const transformedMenu = {
      ...menu,
      menuItems: menu.menuItemsOnMenu.map(item => item.menuItem)
    };

    return NextResponse.json(transformedMenu);
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
        menuItemsOnMenu: {
          deleteMany: {}, // Remove all existing relations
          create: menuItemIds.map((menuItemId) => ({
            menuItem: { connect: { id: menuItemId } }
          }))
        }
      },
      include: {
        menuItemsOnMenu: {
          include: {
            menuItem: true
          }
        }
      },
    });

    // Transform the data to match the expected structure in the frontend
    const transformedMenu = {
      ...updatedMenu,
      menuItems: updatedMenu.menuItemsOnMenu.map(item => item.menuItem)
    };

    return NextResponse.json(transformedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Error updating menu' }, { status: 500 });
  }
}
