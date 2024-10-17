import { NextResponse } from 'next/server';
import prisma from 'path-to-your-prisma-instance';

export async function POST(request) {
  const orderItems = await request.json();

  try {
    // Create a new order in the database
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        orderItems: {
          create: orderItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
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
  }
}
