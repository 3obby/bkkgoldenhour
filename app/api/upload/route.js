import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = `${uuidv4()}-${file.name}`;

  try {
    // Resize the image using sharp
    const resizedImageBuffer = await sharp(buffer)
      .resize(150, 150)
      .toBuffer();

    // Upload the resized image to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `menu-items/${fileName}`,
      Body: resizedImageBuffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable', // Added cache header
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const imageUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
