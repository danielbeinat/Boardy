import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button, Input, Modal } from "../ui";
import { useUIStore } from "../../store";
import { authService } from "../../services";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode,
}) => {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [showPassword, setShowPassword] = useState(false);

  // Update isLogin when mode prop changes
  React.useEffect(() => {
    setIsLogin(mode === "login");
    resetForm();
  }, [mode]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { setCurrentUser, addNotification, clearNotifications } = useUIStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (
      !isLogin &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)
    ) {
      newErrors.password =
        "Debe contener una mayúscula, una minúscula y un número";
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "El nombre es requerido";
      } else if (formData.name.length < 2) {
        newErrors.name = "El nombre debe tener al menos 2 caracteres";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await authService.login(formData.email, formData.password);
      } else {
        response = await authService.register(
          formData.name,
          formData.email,
          formData.password,
        );
      }

      if (response.success && response.data) {
        setCurrentUser(response.data.user);
        clearNotifications();
        addNotification({
          type: "success",
          title: isLogin ? "Inicio de sesión exitoso" : "Registro exitoso",
          message: isLogin
            ? "¡Bienvenido de vuelta!"
            : "¡Cuenta creada exitosamente!",
        });
        onClose();
        resetForm();
      } else {
        // Handle validation errors from backend
        if (response.errors && Array.isArray(response.errors)) {
          const validationErrors: Record<string, string> = {};
          response.errors.forEach((error: any) => {
            // express-validator uses 'path' or 'param' depending on version
            const field = error.path || error.param;
            if (field) {
              validationErrors[field] = error.msg;
            }
          });
          setErrors(validationErrors);
        } else {
          setErrors({
            general: response.message || "Error en la autenticación",
          });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({
        general: "Error de conexión. Por favor intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p className="text-gray-600">
            {isLogin
              ? "Ingresa tus credenciales para acceder al tablero"
              : "Crea una cuenta para empezar a usar el tablero"}
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Input
                label="Nombre"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                error={errors.name}
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
            </div>
          )}

          <div>
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              error={errors.email}
              icon={<Mail className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div>
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              error={errors.password}
              icon={<Lock className="w-4 h-4 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
          </div>

          {!isLogin && (
            <div>
              <Input
                label="Confirmar Contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="•••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                error={errors.confirmPassword}
                icon={<Lock className="w-4 h-4 text-gray-400" />}
              />
            </div>
          )}

          {Object.keys(errors).filter((key) => key !== "general").length >
            0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Por favor corrige los errores</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="text-center">
          <p className="text-gray-600">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};
