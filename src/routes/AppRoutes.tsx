import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { RoleHomeRedirect } from '../components/RoleHomeRedirect';
import { AppLayout } from '../components/layout/AppLayout';
import { AppProvider } from '../context/AppContext';
import { TenantDataProvider } from '../context/TenantDataContext';
import { LoginPage } from '../pages/LoginPage';
import { BatchDashboardPage } from '../pages/batch/BatchDashboardPage';
import { BatchSettingsPage } from '../pages/batch/BatchSettingsPage';
import { BatchDetailPage } from '../pages/batches/BatchDetailPage';
import { BatchListPage } from '../pages/batches/BatchListPage';
import { BrandDashboardPage } from '../pages/brand/BrandDashboardPage';
import { BrandFraudPage } from '../pages/brand/BrandFraudPage';
import { BrandGeoPage } from '../pages/brand/BrandGeoPage';
import { BrandLoyaltyPage } from '../pages/brand/BrandLoyaltyPage';
import { BrandSettingsPage } from '../pages/brand/BrandSettingsPage';
import { GiftsAnalyticsPage } from '../pages/gifts/GiftsAnalyticsPage';
import { GiftsDetailPage } from '../pages/gifts/GiftsDetailPage';
import { GiftsListPage } from '../pages/gifts/GiftsListPage';
import { InvClosedPage } from '../pages/investigations/InvClosedPage';
import { InvDashboardPage } from '../pages/investigations/InvDashboardPage';
import { InvDetailPage } from '../pages/investigations/InvDetailPage';
import { InvQueuePage } from '../pages/investigations/InvQueuePage';
import { InvSettingsPage } from '../pages/investigations/InvSettingsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { OwnerDashboardPage } from '../pages/owner/OwnerDashboardPage';
import { OwnerSettingsPage } from '../pages/owner/OwnerSettingsPage';
import { ProductDetailPage } from '../pages/products/ProductDetailPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { StickerOrdersPage } from '../pages/stickers/StickerOrdersPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <TenantDataProvider>
              <AppProvider>
                <AppLayout />
              </AppProvider>
            </TenantDataProvider>
          }
        >
          <Route index element={<RoleHomeRedirect />} />
          <Route path="owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="owner/settings" element={<OwnerSettingsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/detail" element={<ProductDetailPage />} />
          <Route path="batches" element={<BatchListPage />} />
          <Route path="batches/detail" element={<BatchDetailPage />} />
          <Route path="sticker-orders" element={<StickerOrdersPage />} />
          <Route path="batch/dashboard" element={<BatchDashboardPage />} />
          <Route path="batch/settings" element={<BatchSettingsPage />} />
          <Route path="brand/dashboard" element={<BrandDashboardPage />} />
          <Route path="brand/geo" element={<BrandGeoPage />} />
          <Route path="brand/loyalty" element={<BrandLoyaltyPage />} />
          <Route path="brand/fraud" element={<BrandFraudPage />} />
          <Route path="brand/settings" element={<BrandSettingsPage />} />
          <Route path="investigations/dashboard" element={<InvDashboardPage />} />
          <Route path="investigations/queue" element={<InvQueuePage />} />
          <Route path="investigations/detail" element={<InvDetailPage />} />
          <Route path="investigations/settings" element={<InvSettingsPage />} />
          <Route path="investigations/closed" element={<InvClosedPage />} />
          <Route path="gifts" element={<GiftsListPage />} />
          <Route path="gifts/detail" element={<GiftsDetailPage />} />
          <Route path="gifts/analytics" element={<GiftsAnalyticsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/owner/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
