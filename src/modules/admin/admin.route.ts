import express, { Router }  from 'express';
import { userController } from './admin.controller';
import auth, { UserRole } from '../../middlewares/auth';


const router = express.Router()

router.get('/',auth(UserRole.ADMIN), userController.getUsers)
router.patch('/:userId',auth(UserRole.ADMIN),userController.banUser)
router.get('/statistics',auth(UserRole.ADMIN),userController.getAdminChartData)


export const adminRouter: Router = router

