// clearDatabase.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.menuItemOnMenu.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menu.deleteMany({});
}

clearDatabase()
  .then(() => {
    console.log('All data cleared successfully.');
  })
  .catch((error) => {
    console.error('Error clearing data:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });