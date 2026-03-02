import InventoryPage from '../../components/inventory/InventoryPage';

export const metadata = { title: 'Tackle — Carper' };

export default function InventoryRoute() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <InventoryPage />
    </div>
  );
}
