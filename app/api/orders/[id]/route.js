import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
      },
      select: {
        status: true,
      },
    });

    if (order) {
      return NextResponse.json({ status: order.status });
    } else {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Failed to fetch order status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
