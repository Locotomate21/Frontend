    import React from "react";
    import { useAuthStore } from "../store/authStore";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

    // 🔹 Secciones de Configuración (puedes separarlas en archivos si crecen mucho)
    const AccountSettings = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cuenta</h3>
        <div className="space-y-2">
        <label className="block text-sm font-medium">Nombre completo</label>
        <input
            type="text"
            placeholder="Editar nombre"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        />

        <label className="block text-sm font-medium">Contraseña</label>
        <input
            type="password"
            placeholder="Nueva contraseña"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-500"
        />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Guardar cambios
        </button>
    </div>
    );

    const NotificationSettings = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notificaciones</h3>
        <div className="space-y-2">
        <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked />
            <span>Email</span>
        </label>
        <label className="flex items-center space-x-2">
            <input type="checkbox" />
            <span>App (en tiempo real)</span>
        </label>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Guardar preferencias
        </button>
    </div>
    );

    // 🔹 Opciones avanzadas para roles especiales
    const RepresentativeSettings = () => (
    <div>
        <h3 className="text-lg font-semibold">Opciones de Representante</h3>
        <p className="text-sm text-gray-600">
        Configura la forma en que envías comunicados a los residentes.
        </p>
        <button className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
        Administrar comunicados
        </button>
    </div>
    );

    const AdminSettings = () => (
    <div>
        <h3 className="text-lg font-semibold">Opciones de Administrador</h3>
        <p className="text-sm text-gray-600">
        Controla los permisos y accesos globales.
        </p>
        <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
        Administrar usuarios
        </button>
    </div>
    );

    const SettingsPage: React.FC = () => {
    const { auth } = useAuthStore((state) => state);
    const role = auth?.role || "resident";

    return (
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-6">Configuración</h2>

        <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            {(role === "representative" || role === "admin") && (
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
            )}
            </TabsList>

            {/* Cuenta */}
            <TabsContent value="account">
            <AccountSettings />
            </TabsContent>

            {/* Notificaciones */}
            <TabsContent value="notifications">
            <NotificationSettings />
            </TabsContent>

            {/* Avanzado */}
            <TabsContent value="advanced">
            {role === "representative" && <RepresentativeSettings />}
            {role === "admin" && <AdminSettings />}
            {role !== "representative" && role !== "admin" && (
                <p className="text-sm text-gray-500">
                No tienes acceso a configuraciones avanzadas.
                </p>
            )}
            </TabsContent>
        </Tabs>
        </div>
    );
    };

    export default SettingsPage;
