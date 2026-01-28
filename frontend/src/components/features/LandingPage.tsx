import React from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  CheckCircle,
  Users,
  Zap,
  Calendar,
  Star,
  ArrowRight,
  Mail,
  User,
} from "lucide-react";
import { Button } from "../ui";
import { useUIStore } from "../../store";

interface LandingPageProps {
  onOpenAuth: (mode: "login" | "register") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const features = [
    {
      icon: <LayoutGrid className="w-6 h-6" />,
      title: "Tablero Visual",
      description: "Organiza tus tareas en un tablero intuitivo y visual",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Arrastrar y Soltar",
      description: "Mueve tarjetas entre listas con drag and drop",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Colaboración",
      description: "Trabaja en equipo con múltiples usuarios",
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Fechas Límite",
      description: "Establece fechas de vencimiento para tus tareas",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Etiquetas",
      description: "Categoriza tus tareas con etiquetas de colores",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Progreso",
      description: "Visualiza el avance de tus proyectos",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
      {/* Navigation */}
      <nav className="bg-blue-800/40 backdrop-blur-md border-b border-white/10">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-white" />
              <h1 className="text-xl font-bold text-white">Boardy</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenAuth("login")}
                className="text-white hover:bg-white/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
              <Button
                onClick={() => onOpenAuth("register")}
                className="bg-white text-blue-600 hover:bg-gray-50"
              >
                <User className="w-4 h-4 mr-2" />
                Registrarse
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Organiza tu trabajo
              <span className="block text-blue-200">como nunca antes</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Gestiona tus proyectos, tareas y colabora con tu equipo en una
              interfaz intuitiva y moderna inspirada en Trello.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => onOpenAuth("register")}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4"
              >
                <User className="w-5 h-5 mr-2" />
                Comenzar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => onOpenAuth("login")}
                className="text-white hover:bg-white/10 px-8 py-4"
              >
                <Mail className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
{/* Features Grid */}
      
      {/* Features Grid */}
      <div className="px-4 sm:px-6 py-20 bg-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Características Principales
            </h2>
            <p className="text-blue-100 text-lg">
              Todo lo que necesitas para gestionar tus proyectos de manera
              eficiente
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-blue-100">{feature.description}</p>
              </motion.div>
            ))}
          </        </div>


      {/* CTA Section */}
      <div className="px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Únete a miles de usuarios que ya organizan su trabajo con nuestra
              herramienta
            </p>
            <Button
              onClick={() => onOpenAuth("register")}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4"
            >
              <User className="w-5 h-5 mr-2" />
              Crear Cuenta Gratuita
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-100">
            Boardy © 2026. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
