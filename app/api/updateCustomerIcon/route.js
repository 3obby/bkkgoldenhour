import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Parse the JSON data from the request body
    const { customerId, customerIcon } = await request.json();

    // Validate the received data
    if (!customerId || !customerIcon) {
      return NextResponse.json(
        { error: 'customerId and customerIcon are required' },
        { status: 400 }
      );
    }

    // Update the customer in the database
    await prisma.customer.update({
      where: { id: customerId },
      data: { customerIcon },
    });

    return NextResponse.json(
      { message: 'Customer icon updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating customer icon:', error);
    return NextResponse.json(
      { error: 'Failed to update customer icon' },
      { status: 500 }
    );
  }
}
