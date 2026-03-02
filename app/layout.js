import './globals.css';
import { AppProvider } from '../lib/context/AppContext';
import { InventoryProvider } from '../lib/context/InventoryContext';
import { LocationsProvider } from '../lib/context/LocationsContext';
import BottomNav from '../components/layout/BottomNav';
import Toast from '../components/layout/Toast';

export const metadata = {
  title: 'Carper',
  description: 'Tackle inventory & fishing locations for UK carp angling',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#080c0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <AppProvider>
          <InventoryProvider>
            <LocationsProvider>
              {/* Full-height flex column — header + content + nav */}
              <div className="flex flex-col h-dvh" style={{ background: 'var(--bg)' }}>
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  {children}
                </div>
                <BottomNav />
              </div>
              <Toast />
            </LocationsProvider>
          </InventoryProvider>
        </AppProvider>
      </body>
    </html>
  );
}
