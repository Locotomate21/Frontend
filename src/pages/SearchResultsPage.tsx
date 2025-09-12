    import React, { useEffect, useState } from "react";
    import { useLocation } from "react-router-dom";
    import { useAuthStore } from "../store/authStore";
    import axios from "axios";

    interface SearchResult {
    id: string;
    title: string;
    type: string;
    description?: string;
    }

    const SearchResultsPage: React.FC = () => {
    const { auth } = useAuthStore((state) => state);
    const role = auth?.role || "resident";

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query") || "";

    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
        if (!query.trim()) return;

        setLoading(true);

        try {
            // 🔹 Aquí puedes hacer fetch a tu backend según el rol
            // Por ejemplo:
            const token = localStorage.getItem("token");
            const endpoint =
            role === "representative"
                ? `/representative/search?query=${encodeURIComponent(query)}`
                : `/resident/search?query=${encodeURIComponent(query)}`;

            const res = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
            });

            setResults(res.data || []);
        } catch (err) {
            console.error("Error al buscar:", err);
            setResults([]);
        } finally {
            setLoading(false);
        }
        };

        fetchResults();
    }, [query, role]);

    return (
        <div>
        <h1 className="text-xl font-bold mb-4">Resultados de búsqueda: "{query}"</h1>

        {loading ? (
            <p>Cargando resultados...</p>
        ) : results.length === 0 ? (
            <p>No se encontraron resultados.</p>
        ) : (
            <ul className="space-y-2">
            {results.map((r) => (
                <li key={r.id} className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
                <p className="font-medium">{r.title}</p>
                {r.description && <p className="text-sm text-gray-500">{r.description}</p>}
                <p className="text-xs text-gray-400">{r.type}</p>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
    };

    export default SearchResultsPage;
