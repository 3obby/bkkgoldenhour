import { headers } from 'next/headers';
import MenuClient from './MenuClient';

// Fetch data on the server side
export default async function Menu() {
  // Get the headers
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');

  // Construct the base URL
  const baseUrl = `${protocol}://${host}`;

  // Fetch categories
  const resCategories = await fetch(`${baseUrl}/api/admin/categories`, { cache: 'no-store' });
  const categoriesData = await resCategories.json();

  // Fetch menu items
  const resMenuItems = await fetch(`${baseUrl}/api/admin/menuitems`, { cache: 'no-store' });
  const menuItemsData = await resMenuItems.json();

  return (
    <MenuClient
      categories={categoriesData.categories}
      initialMenuItems={menuItemsData}
    />
  );
}
