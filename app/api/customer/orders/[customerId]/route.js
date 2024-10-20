import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { customerId } = params;

  try {
    const orders = await prisma.order.findMany({
      where: {
        customerId: customerId,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
