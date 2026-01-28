import React, { useEffect } from "react";
import { DragAndDropProvider, AuthModal } from "./components/features";
import { Board } from "./components/board";
import { LandingPage } from "./components/features";
import { useUIStore } from "./store";
import { authService } from "./services";
import { NotificationCenter } from "./components/ui";

export const App: React.FC = () => {
  const { currentUser, setCurrentUser, logout, addNotification } = useUIStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setCurrentUser(response.data);
            addNotification({
              type: "success",
              title: "Bienvenido de vuelta",
              message: "Sesión restaurada exitosamente",
            });
          } else {
            // Token is invalid, clear it
            authService.clearToken();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        authService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setCurrentUser, addNotification]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      addNotification({
        type: "info",
        title: "Sesión cerrada",
        message: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even on error
      logout();
      authService.clearToken();
    }
  };

  const openAuthModal = (mode: "login" | "register") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show landing page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onLogin={() => openAuthModal("login")}
          onRegister={() => openAuthModal("register")}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          mode={authMode}
        />
      </>
    );
  }

  // User is logged in, show the board
  return (
    <DragAndDropProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Trello Clone</h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: currentUser.avatarColor }}
                />
                <span>{currentUser.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* Main Board */}
        <main className="flex-1">
          <Board />
        </main>

        {/* Notifications */}
        <NotificationCenter />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
      />
    </DragAndDropProvider>
  );
};
