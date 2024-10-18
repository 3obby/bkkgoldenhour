import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Handle GET, POST, PUT requests based on method
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    // Fetch single item
    try {
      const item = await prisma.menuItem.findUnique({
        where: { id: parseInt(id) },
        include: {
          menuItemCategories: {
            include: { category: true },
          },
        },
      });

      if (item) {
        // Format categories
        item.categories = item.menuItemCategories.map((mic) => mic.category);
        return NextResponse.json(item);
      } else {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      return NextResponse.json({ error: 'Error fetching item' }, { status: 500 });
    }
  } else {
    // Handle fetching all items if needed
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id, name, description, price, imageUrl, categories } = data;

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrl,
        // Other fields as needed
      },
    });

    // Update categories
    if (categories && categories.length > 0) {
      // Disconnect existing categories
      await prisma.menuItemCategory.deleteMany({
        where: { menuItemId: id },
      });

      // Upsert categories and connect
      for (const categoryName of categories) {
        const category = await prisma.category.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName },
        });

        await prisma.menuItemCategory.create({
          data: {
            menuItemId: id,
            categoryId: category.id,
          },
        });
      }
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Error updating item' }, { status: 500 });
  }
}
