import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  const { orderItems, tableNumber, customerId } = await request.json();

  try {
    const order = await prisma.order.create({
      data: {
        status: 'pending',
        tableNumber: tableNumber ? parseInt(tableNumber) : null,
        customer: customerId
          ? {
              connectOrCreate: {
                where: { id: customerId },
                create: { id: customerId },
              },
            }
          : undefined,
        orderItems: {
          create: orderItems.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            comment: item.comment || null,
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
        orderItems: true,
      },
    });

    return NextResponse.json({ message: 'Order submitted', order });
  } catch (error) {
    console.error('Error submitting order:', error);
    return NextResponse.json(
      { error: 'Failed to submit order' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
