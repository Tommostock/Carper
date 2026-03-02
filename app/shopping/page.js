import ShoppingPage from '../../components/shopping/ShoppingPage';

export const metadata = { title: 'Shopping — Carper' };

export default function ShoppingRoute() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ShoppingPage />
    </div>
  );
}
