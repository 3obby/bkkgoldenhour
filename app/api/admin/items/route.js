import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjusted import path

export async function POST(request) {
  try {
    const { name, description, price, imageUrl, categories } = await request.json();

    if (!name || !description || !price || !imageUrl || !categories) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare categories for connectOrCreate
    const categoryData = categories.map((categoryName) => ({
      where: { name: categoryName },
      create: { name: categoryName },
    }));

    // Create menu item in the database
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        menuItemCategories: {
          create: categoryData.map((category) => ({
            category: {
              connectOrCreate: category,
            },
          })),
        },
      },
      include: {
        menuItemCategories: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Error creating item' }, { status: 500 });
  }
}
