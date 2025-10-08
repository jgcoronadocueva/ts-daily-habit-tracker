// routes/habitRoutes.ts

import { Router } from 'express';
import { HabitController } from '../controllers/habitController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router: Router = Router();

// GET /habits
router.get('/', asyncHandler(HabitController.getAll)); 
// GET /habits/:id
router.get('/:id', asyncHandler(HabitController.getById));
// POST /habits
router.post('/', asyncHandler(HabitController.create));
// PUT /habits/:id
router.put('/:id', asyncHandler(HabitController.update));
// DELETE /habits/:id
router.delete('/:id', asyncHandler(HabitController.delete));

export default router;