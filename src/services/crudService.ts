import { api } from './api';

export const crudService = {
    async getAll(table: string) {
        const data = await api.get<any[]>(`/${table}`);
        return Array.isArray(data) ? data : [];
    },
    async getById(table: string, id: string) {
        return api.get<any>(`/${table}/${id}`);
    },
    async create(table: string, data: any) {
        return api.post<any>(`/${table}`, data);
    },
    async update(table: string, id: string, data: any) {
        return api.put<any>(`/${table}/${id}`, data);
    },
    async remove(table: string, id: string) {
        return api.delete<any>(`/${table}/${id}`);
    }
};
