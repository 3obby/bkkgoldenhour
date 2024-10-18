import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = params;
  const { status } = await request.json();

  try {
    await prisma.order.update({
      where: {
        id: parseInt(id),
      },
      data: {
        status,
      },
    });

    return NextResponse.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
