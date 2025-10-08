// controllers/habitController.ts

import { Request, Response, NextFunction } from 'express';
import { habitManager } from '../services/habitManager.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * HabitController
 * Handles incoming HTTP requests related to Habit objects.
 * Delegates business logic to HabitManager.
 */
export const HabitController = {
  // Get all habits
  async getAll(_req: Request, res: Response) {
    const habits = await habitManager.getHabits();
    console.log('GET /habits: All habits retrieved');
    res.json(habits);
  },

  // Get a habit by ID
  async getById(req: Request, res: Response) {
    const id = +req.params.id;
    const habit = await habitManager.getHabitById(id);
    console.log(`GET /habits/${id}: Habit with ID ${id} retrieved`);
    res.json(habit);
  },

  // Create a new habit
  async create(req: Request, res: Response) {
    const { title, description, parentId } = req.body;

    if (!title || !description) {
      throw new ApiError('Title and description are required', 400);
    }

    const habit = await habitManager.createHabit(title, description, parentId);
    console.log('POST /habits: New habit created', { id: habit.id, title: habit.title });
    res.status(201).json(habit);
  },

  // Update a habit
  async update(req: Request, res: Response) {
    const id = +req.params.id;
    const { title, description, completed, streak } = req.body;

    const habit = await habitManager.updateHabit(
      id,
      title,
      description,
      completed,
      streak
    );
    console.log(`PUT /habits/${id}: Habit with ID ${id} updated`);
    res.json(habit);
  },

  // Delete a habit
  async delete(req: Request, res: Response) {
    const id = +req.params.id;
    await habitManager.deleteHabit(id);
    console.log(`DELETE /habits/${id}: Habit with ID ${id} deleted`);
    res.status(204).send();
  }
};