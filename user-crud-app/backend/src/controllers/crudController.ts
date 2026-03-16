import { Request, Response } from 'express';
import pool from '../config/db';

const cleanBody = (body: any) => {
    const cleaned: any = {};
    // Extended list of fields to exclude (frontend only or calculated)
    const exclude = [
        'departments', 'history', 'familyMembers', 
        'maintenanceHistory', 'historyLog',
        'familyMembersData'
    ];

    for (const key in body) {
        if (exclude.includes(key)) continue;

        const value = body[key];
        
        if (value === null) {
            cleaned[key] = null;
        } else if (typeof value === 'object' || Array.isArray(value)) {
            // Stringify objects and arrays for TEXT/JSON columns
            cleaned[key] = JSON.stringify(value);
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            // Check if string is an ISO date and convert to Date object for node-mysql2
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
                cleaned[key] = new Date(value);
            } else {
                cleaned[key] = value;
            }
        }
    }
    return cleaned;
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
        
        console.log(`[CRUD] Creating in ${tableName}:`, body);
        await pool.query(sql, values);
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
        const [rows]: any = await pool.query(`SELECT * FROM ${tableName}`);
        
        // Parse JSON strings back to objects/arrays
        const parsedRows = rows.map((row: any) => {
            const parsed = { ...row };
            for (const key in parsed) {
                const val = parsed[key];
                if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                    try {
                        parsed[key] = JSON.parse(val);
                    } catch (e) {
                        // Not JSON, leave as is
                    }
                }
            }
            return parsed;
        });
        
        res.json(parsedRows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records', error });
    }
};

export const remove = async (req: Request, res: Response) => {
    const tableName = getTableName(req);
    const { id } = req.params;
    try {
        // Check if table has isArchived column
        const [cols]: any = await pool.query(`SHOW COLUMNS FROM ${tableName} LIKE 'isArchived'`);
        
        if (cols.length > 0) {
            // Soft delete
            await pool.query(`UPDATE ${tableName} SET isArchived = 1, status = 'inactive' WHERE id = ?`, [id]);
            res.json({ message: 'Record archived' });
        } else {
            // Hard delete
            await pool.query(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
            res.json({ message: 'Record deleted' });
        }
    } catch (error) {
        console.error('SQL Error in remove:', error);
        res.status(500).json({ message: 'Error deleting record', error });
    }
};
