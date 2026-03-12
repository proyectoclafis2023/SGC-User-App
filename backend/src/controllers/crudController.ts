import { Request, Response } from 'express';
import pool from '../config/db';

const cleanBody = (body: any) => {
    // We exclude only pure-frontend UI state or derived arrays that are handled in other tables
    const { 
        departments, // Managed via towerId in departments table
        history,     // Managed via history_logs table
        familyMembers, // If any, though not in schema yet
        ...rest 
    } = body;
    return rest;
};

const getTableName = (req: Request) => {
    // If mounted at /api, path might be /users or /owners
    const p = req.path.split('/')[1];
    if (p) return p;
    return 'unknown';
};

export const create = async (req: Request, res: Response) => {
    const tableName = getTableName(req);
    const body = cleanBody(req.body);
    
    if (!body.id) {
        body.id = Math.random().toString(36).substr(2, 9);
    }

    try {
        const columns = Object.keys(body);
        const values = Object.values(body);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        await pool.query(sql, values);
        
        // Always return the complete saved object
        res.status(201).json(body);
    } catch (error) {
        console.error('SQL Error in create:', error);
        res.status(500).json({ message: 'Error creating record', error });
    }
};

export const update = async (req: Request, res: Response) => {
    const tableName = getTableName(req);
    const { id } = req.params;
    const body = cleanBody(req.body);

    try {
        const columns = Object.keys(body);
        const values = Object.values(body);
        const setClause = columns.map(col => `${col} = ?`).join(', ');
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
        
        await pool.query(sql, [...values, id]);
        
        res.json({ id, ...body });
    } catch (error) {
        console.error('SQL Error in update:', error);
        res.status(500).json({ message: 'Error updating record', error });
    }
};

export const getAll = async (req: Request, res: Response) => {
    const tableName = getTableName(req);
    try {
        const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records', error });
    }
};

export const remove = async (req: Request, res: Response) => {
    const tableName = getTableName(req);
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
        res.json({ message: 'Record deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error });
    }
};
