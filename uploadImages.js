// uploadImages.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Import the JSON file
const menuItemsData = require('./uploadImages.json');

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadImageToS3(filePath, fileName) {
  // Read the image file
  const imageBuffer = fs.readFileSync(filePath);

  // Optimize and resize the image
  const optimizedImage = await sharp(imageBuffer)
    .resize({ height: 600, width: null, withoutEnlargement: true }) // Resize to 180px height, maintaining aspect ratio
    .toBuffer();

  // Generate a unique key for the image in S3
  const imageKey = `menu-items/${fileName}`;

  // Set up S3 upload parameters
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageKey,
    Body: optimizedImage,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000', // Optional: cache control headers
  };

  // Upload the image to S3
  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  // Return the S3 image URL
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${imageKey}`;
}

async function main() {
  const imagesDir = path.join(__dirname, 'itemImages');

  for (const item of menuItemsData) {
    const { fileName, name, description, price, category: categories, options } = item;
    const filePath = path.join(imagesDir, fileName);

    try {
      console.log(`Processing ${fileName}...`);

      // Upload image to S3
      const imageUrl = await uploadImageToS3(filePath, fileName);

      // Ensure categories exist and get their IDs
      const categoryRecords = [];
      for (const categoryName of categories) {
        let categoryRecord = await prisma.category.findUnique({
          where: { name: categoryName },
        });

        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { name: categoryName },
          });
          console.log(`Created new category: ${categoryName}`);
        }

        categoryRecords.push({ id: categoryRecord.id });
      }

      // Create a new menu item
      const menuItem = await prisma.menuItem.create({
        data: {
          name,
          description,
          price,
          imageUrl,
          menuItemCategories: {
            create: categoryRecords.map((category) => ({
              category: {
                connect: { id: category.id },
              },
            })),
          },
        },
      });

      console.log(`Successfully uploaded ${fileName} and created new menu item: ${menuItem.name}`);

      // Create and associate options if they exist
      if (options && options.length > 0) {
        for (const option of options) {
          await prisma.menuItemOption.create({
            data: {
              name: option.name,
              price: option.price,
              menuItemId: menuItem.id,
            },
          });
        }
        console.log(`Added options for ${menuItem.name}`);
      }
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
    }
  }

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('All images uploaded and menu items created.');
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
