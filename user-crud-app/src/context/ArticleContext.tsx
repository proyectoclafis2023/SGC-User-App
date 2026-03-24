import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Article } from '../types';
import { API_BASE_URL } from '../config/api';

export interface ArticleContextType {
    articles: Article[];
    addArticle: (article: Omit<Article, 'id'>) => Promise<void>;
    updateArticle: (article: Article) => Promise<void>;
    deleteArticle: (id: string) => Promise<void>;
    decreaseStock: (articleId: string, quantity: number) => Promise<void>;
    uploadArticles: (file: File) => Promise<{ message: string }>;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/articulos_personal`;

export const ArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [articles, setArticles] = useState<Article[]>([]);

    const fetchArticles = async () => {
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                setArticles(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error('Error fetching articles:', e);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const uploadArticles = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        if (!resp.ok) throw new Error('Error al subir inventario');
        const res = await resp.json();
        await fetchArticles();
        return res;
    };

    const addArticle = async (article: Omit<Article, 'id'>) => {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        });
        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.message || 'Error al agregar el artículo');
        }
        await fetchArticles();
    };

    const updateArticle = async (article: Article) => {
        const resp = await fetch(`${API_URL}/${article.id}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(article)
        });
        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.message || 'Error al actualizar el artículo');
        }
        await fetchArticles();
    };

    const decreaseStock = async (articleId: string, quantity: number) => {
        const article = articles.find(a => a.id === articleId);
        if (article) {
            await updateArticle({ ...article, stock: Math.max(0, article.stock - quantity) });
        }
    };

    const deleteArticle = async (id: string) => {
        const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.message || 'Error al eliminar el artículo');
        }
        await fetchArticles();
    };

    return (
        <ArticleContext.Provider value={{ articles, addArticle, updateArticle, deleteArticle, decreaseStock, uploadArticles }}>
            {children}
        </ArticleContext.Provider>
    );
};

export const useArticles = () => {
    const context = useContext(ArticleContext);
    if (!context) throw new Error('useArticles must be used within ArticleProvider');
    return context;
};
