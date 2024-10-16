import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  const menuItems = await prisma.menuItem.findMany();
  return NextResponse.json(menuItems);
}
