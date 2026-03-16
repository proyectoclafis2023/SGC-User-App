import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, login, changePassword, loginWithGoogle } from '../controllers/userController';

const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/change-password', changePassword);
router.post('/login', login);
router.post('/auth/google', loginWithGoogle);

export default router;
