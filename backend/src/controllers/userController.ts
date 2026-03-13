import { Request, Response } from 'express';
import pool from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const createUser = async (req: Request, res: Response) => {
    const { name, email, role, status } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
        await pool.query(
            'INSERT INTO users (id, name, email, role, status) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, role || 'user', status || 'active']
        );
        res.status(201).json({ id, name, email, role, status });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, status } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ? WHERE id = ?',
            [name, email, role, status, id]
        );
        res.json({ id, name, email, role, status });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Hardcoded admin/admin as requested, but could be checked against DB
    if (username === 'admin' && password === 'admin') {
        res.json({
            isAuthenticated: true,
            user: { name: 'Admin User', role: 'admin' }
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    try {
        await pool.query(
            'UPDATE users SET password = ?, mustChangePassword = false WHERE id = ?',
            [newPassword, id]
        );
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error });
    }
};

export const loginWithGoogle = async (req: Request, res: Response) => {
    const { email, name, photoUrl } = req.body;
    try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        let user = rows[0];

        if (!user) {
            // Variante B: Usuario entra por Google sin pre-carga del Admin
            const insertResult: any = await pool.query(
                'INSERT INTO users (name, email, role, status, photo, mustChangePassword) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, 'pending', 'setting_up', photoUrl, false]
            );
            
            user = {
                id: insertResult[0].insertId,
                name,
                email,
                role: 'pending',
                status: 'setting_up',
                photo: photoUrl,
                mustChangePassword: false
            };
        } else {
            // Variante A: Usuario fue precargado por el Admin (MATCH DE EMAIL EXITOSO)
            // Se actualizan sus datos y se quita la restricción de crear clave manual si la tenía
            await pool.query(
                `UPDATE users SET status = 'active', mustChangePassword = false, photo = COALESCE(photo, ?) WHERE id = ?`,
                [photoUrl, user.id]
            );
            user.status = 'active';
            user.mustChangePassword = false;
            if (!user.photo) user.photo = photoUrl;
        }

        res.json({
            isAuthenticated: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                photo: user.photo,
                relatedId: user.relatedId,
                mustChangePassword: user.mustChangePassword
            }
        });
    } catch (error) {
        console.error('Error with Google login:', error);
        res.status(500).json({ message: 'Error with Google login', error });
    }
};
