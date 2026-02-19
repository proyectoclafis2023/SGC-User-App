import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { SettingsProvider } from './context/SettingsContext';
import { PersonnelProvider } from './context/PersonnelContext';
import { HealthProviderProvider } from './context/HealthProviderContext';
import { PensionFundProvider } from './context/PensionFundContext';
import { ProfileProvider } from './context/ProfileContext';
import { CommonSpaceProvider } from './context/CommonSpaceContext';
import { ReservationProvider } from './context/ReservationContext';
import { InfrastructureProvider } from './context/InfrastructureContext';
import { SystemMessageProvider } from './context/SystemMessageContext';
import { ResidentProvider } from './context/ResidentContext';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { SettingsPage } from './pages/SettingsPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { ResidentsPage } from './pages/ResidentsPage';
import { PrevisionesPage } from './pages/PrevisionesPage';
import { AFPsPage } from './pages/AFPsPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { CommonSpacesPage } from './pages/CommonSpacesPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { SystemMessagesPage } from './pages/SystemMessagesPage';
import { PublicCarouselPage } from './pages/PublicCarouselPage';
import { Layout } from './components/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <UserProvider>
            <HealthProviderProvider>
              <PensionFundProvider>
                <ProfileProvider>
                  <ResidentProvider>
                    <CommonSpaceProvider>
                      <ReservationProvider>
                        <InfrastructureProvider>
                          <SystemMessageProvider>
                            <PersonnelProvider>
                              <Routes>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/visor-mensajes" element={<PublicCarouselPage />} />
                                <Route
                                  path="/*"
                                  element={
                                    <PrivateRoute>
                                      <Layout />
                                    </PrivateRoute>
                                  }
                                >
                                  <Route index element={<Dashboard />} />
                                  <Route path="personal" element={<PersonnelPage />} />
                                  <Route path="residentes" element={<ResidentsPage />} />
                                  <Route path="previsiones" element={<PrevisionesPage />} />
                                  <Route path="afps" element={<AFPsPage />} />
                                  <Route path="perfiles" element={<ProfilesPage />} />
                                  <Route path="infraestructura" element={<InfrastructurePage />} />
                                  <Route path="espacios" element={<CommonSpacesPage />} />
                                  <Route path="reservas" element={<ReservationsPage />} />
                                  <Route path="mensajes" element={<SystemMessagesPage />} />
                                  <Route path="configuracion" element={<SettingsPage />} />
                                  <Route path="*" element={<Navigate to="/" replace />} />
                                </Route>
                              </Routes>
                            </PersonnelProvider>
                          </SystemMessageProvider>
                        </InfrastructureProvider>
                      </ReservationProvider>
                    </CommonSpaceProvider>
                  </ResidentProvider>
                </ProfileProvider>
              </PensionFundProvider>
            </HealthProviderProvider>
          </UserProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
