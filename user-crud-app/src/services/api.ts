import { API_BASE_URL } from '../config/api';

export const api = {
    async get<T>(path: string): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    async post<T>(path: string, body: any): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    async put<T>(path: string, body: any): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
    async delete<T>(path: string): Promise<T> {
        const res = await fetch(`${API_BASE_URL}${path}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    }
};
