import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

export default function DebugKV() {
    const { puterReady, kv } = usePuterStore();
    const [items, setItems] = useState<{ key: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchKV = async () => {
            setLoading(true);
            try {
                const results = (await kv.list("resume:*", true)) as { key: string; value: string }[];
                setItems(results || []);
            } catch (err) {
                console.error("Failed to list KV:", err);
            } finally {
                setLoading(false);
            }
        };

        if (puterReady) {
            fetchKV();
        }
    }, [puterReady]);

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
            <h1>Debug Puter KV Store</h1>
            {loading ? (
                <p>Loading keys...</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <p>Total resumes found: {items.length}</p>
                    {items.map((item) => {
                        let parsed;
                        try {
                            parsed = JSON.parse(item.value);
                        } catch {
                            parsed = "Invalid JSON";
                        }
                        return (
                            <div key={item.key} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", background: "#fff" }}>
                                <h3>Key: {item.key}</h3>
                                <pre style={{ background: "#272822", color: "#f8f8f2", padding: "10px", borderRadius: "4px", overflowX: "auto" }}>
                                    {JSON.stringify(parsed, null, 2)}
                                </pre>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
