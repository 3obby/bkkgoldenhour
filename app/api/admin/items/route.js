import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, description, price, imageUrl } = await request.json();

    if (!name || !description || !price || !imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create menu item in the database
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Error creating item' }, { status: 500 });
  }
}
