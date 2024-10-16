import { NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request, { params }) {
  const { id } = params;
  const menuItems = await prisma.menuItem.findMany({
    where: { menuId: parseInt(id) },
  });
  return NextResponse.json(menuItems);
}

export async function POST(request, { params }) {
  const { id } = params;
  const formData = await request.formData();
  const name = formData.get('name');
  const description = formData.get('description');
  const price = parseFloat(formData.get('price'));
  const image = formData.get('image');

  // Upload image to S3
  const imageKey = `menu-items/${uuidv4()}-${image.name}`;
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageKey,
    Body: Buffer.from(await image.arrayBuffer()),
    ContentType: image.type,
  };
  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${imageKey}`;

  // Create menu item in database
  const newItem = await prisma.menuItem.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      menu: { connect: { id: parseInt(id) } },
    },
  });
  return NextResponse.json(newItem);
}
