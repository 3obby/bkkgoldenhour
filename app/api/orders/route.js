import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  try {
    const { customerId, x, z, orderItems } = await request.json();

    const order = await prisma.order.create({
      data: {
        x,
        z,
        customer: {
          connectOrCreate: {
            where: { id: customerId },
            create: { id: customerId },
          },
        },
        orderItems: {
          create: orderItems.map((item) => ({
            menuItemId: item.menuItemId, // Use menuItemId directly
            quantity: item.quantity,
            comment: item.comment,
            orderItemOptions: item.selectedOptionId
              ? {
                  create: {
                    menuItemOptionId: item.selectedOptionId,
                  },
                }
              : undefined,
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
