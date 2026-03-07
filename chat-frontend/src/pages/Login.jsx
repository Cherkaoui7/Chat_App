import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login({ email, password });
            navigate("/chat");
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.message);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Login to Chat</h2>
                {error && <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-600">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded border px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded border px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
}
