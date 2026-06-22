import { FoodListing } from './types';

export const downloadCSV = (listings: FoodListing[], filename: string = 'foodorbit-export.csv') => {
  // Define CSV headers
  const headers = ['ID', 'Title', 'Quantity', 'Tier', 'Status', 'Organizer', 'ClaimedBy', 'CreatedAt', 'ExpiryTime', 'Address'];
  
  // Map rows
  const rows = listings.map(l => [
    l.id,
    `"${l.title.replace(/"/g, '""')}"`,
    `"${l.quantity}"`,
    l.tier,
    l.status,
    `"${(l.organizerName || '').replace(/"/g, '""')}"`,
    `"${(l.claimedByName || '').replace(/"/g, '""')}"`,
    new Date(l.createdAt).toISOString(),
    new Date(l.expiryTime).toISOString(),
    `"${(l.address || '').replace(/"/g, '""')}"`
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
