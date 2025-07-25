    import React from 'react';

    const Home = () => {
    return (
        <>
        <header className="mb-6">
            <h1 className="text-3xl font-semibold">Bienvenido al Dashboard</h1>
            <p className="text-gray-600">Resumen del sistema de residencia</p>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold">Total Estudiantes</h3>
            <p className="text-gray-500">42 registrados</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold">Habitaciones Ocupadas</h3>
            <p className="text-gray-500">25 de 50</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-bold">Servicios Activos</h3>
            <p className="text-gray-500">5 servicios</p>
            </div>
        </div>
        </>
    );
    };

    export default Home;
