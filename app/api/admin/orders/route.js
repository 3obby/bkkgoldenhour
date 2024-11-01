import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const orders = await prisma.order.findMany({
      // Remove the where clause to fetch all orders
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
            orderItemOptions: {
              include: {
                menuItemOption: true,
              },
            },
          },
        },
        customer: true, // Include customer details
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
