import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

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

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
  }
}
