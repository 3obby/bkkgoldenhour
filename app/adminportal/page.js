'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPortal() {
  const [menus, setMenus] = useState([]);
  const [newMenuName, setNewMenuName] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchMenus() {
      const response = await fetch('/api/admin/menus');
      const data = await response.json();
      setMenus(data);
    }
    fetchMenus();
  }, []);

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/admin/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMenuName }),
    });
    if (response.ok) {
      const newMenu = await response.json();
      setMenus((prevMenus) => [...prevMenus, newMenu]);
      setNewMenuName('');
    }
  };

  const handleEditMenu = (menuId) => {
    router.push(`/editmenu?id=${menuId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Portal</h1>

        {/* Create New Menu */}
        <form onSubmit={handleCreateMenu} className="mb-12">
          <div className="flex items-center">
     
            
          </div>
        </form>

        {/* List of Menus */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Menus</h2>
        <ul className="space-y-4">
          {menus.map((menu) => (
            <li key={menu.id} className="bg-white shadow overflow-hidden rounded-md px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{menu.name}</h3>
                <button
                  onClick={() => handleEditMenu(menu.id)}
                  className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Menu
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Menu
            </button>
      </div>
    </div>
  );
}
