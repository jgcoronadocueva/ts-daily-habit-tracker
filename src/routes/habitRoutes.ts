// routes/habitRoutes.ts

import { Router } from 'express';
import { HabitController } from '../controllers/habitController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router: Router = Router();

router.get('/', asyncHandler(HabitController.getAll));
router.get('/:id', asyncHandler(HabitController.getById));
router.post('/', asyncHandler(HabitController.create));
router.put('/:id', asyncHandler(HabitController.update));
router.delete('/:id', asyncHandler(HabitController.delete));

export default router;