import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request) {
  const { orderItems } = await request.json();

  const order = await prisma.order.create({
    data: {
      orderItems: {
        create: orderItems.map((item) => ({
          menuItem: { connect: { id: item.menuItemId } },
          quantity: item.quantity,
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
}
