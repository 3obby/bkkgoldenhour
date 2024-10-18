import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { orderItems, tableNumber } = await request.json();

  try {
    // Create a new order in the database
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        tableNumber: tableNumber ? parseInt(tableNumber) : null,
        orderItems: {
          create: orderItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            comment: item.comment || null,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json({ message: 'Order submitted', order });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json({ error: 'Failed to submit order' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
