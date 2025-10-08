import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Habit } from '../models/Habit.js';
import { ApiError } from '../middleware/errorHandler.js';

// Construct the absolute path to the habits.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'habits.json'); 

class HabitManager {
  private isWriting = false;

  private async acquireLock(): Promise<void> {
    while (this.isWriting) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.isWriting = true;
  }

  private releaseLock(): void {
    this.isWriting = false;
  }
  
  private async readHabits(): Promise<Habit[]> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');

      if (data.trim() === '') {
        return [];
      }

      const habitsData = JSON.parse(data);
      return habitsData.map((h: any) => {
        const habit = new Habit(h.id, h.title, h.description);
        Object.assign(habit, h);
        return habit;
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Error reading habits file:', error);
      throw new ApiError('Could not read habits data', 500);
    }
  }

  private async writeHabits(habits: Habit[]): Promise<void> {
    await this.acquireLock();
    try {
      const data = JSON.stringify(habits, null, 2);
      await fs.writeFile(DATA_FILE, data, 'utf8');
      console.log('Successfully wrote data to file.');
    } catch (err) {
      console.error('Failed to write to habits.json:', err);
      throw new ApiError('Failed to persist habit data.', 500);
    } finally {
      this.releaseLock();
    }
  }
  
  private async findHabitByIdRecursive(id: number, habits: Habit[]): Promise<Habit | undefined> {
    for (const habit of habits) {
      if (habit.id === id) {
        return habit;
      }
      if (habit.subHabits && habit.subHabits.length > 0) {
        const subHabit = await this.findHabitByIdRecursive(id, habit.subHabits);
        if (subHabit) {
          return subHabit;
        }
      }
    }
    return undefined;
  }

  // Refactored to be synchronous and accept the habits array
  private getNextId(habits: Habit[]): number {
    const findMaxId = (h: Habit[]): number => {
      let maxId = 0;
      h.forEach(habit => {
        maxId = Math.max(maxId, habit.id, findMaxId(habit.subHabits));
      });
      return maxId;
    };
    return findMaxId(habits) + 1;
  }

  async createHabit(title: string, description: string, parentId?: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    // Pass the in-memory array to getNextId
    const newHabit = new Habit(this.getNextId(allHabits), title, description);
    
    if (parentId) {
      // Find the parent habit within the *current* in-memory `allHabits` array
      const parentHabit = await this.findHabitByIdRecursive(parentId, allHabits); 

      if (!parentHabit) {
        throw new ApiError(`Parent with ID ${parentId} not found`, 404);
      }
      parentHabit.addSubHabit(newHabit);
    } else {
      allHabits.push(newHabit);
    }
    
    await this.writeHabits(allHabits);
    console.log('Habit created:', newHabit.title);
    return newHabit;
  }

  async getHabits(): Promise<Habit[]> {
    const habits = await this.readHabits();
    habits.forEach(h => h.display());
    return habits;
  }

  async findHabitById(id: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    const foundHabit = await this.findHabitByIdRecursive(id, allHabits);

    if (!foundHabit) {
      throw new ApiError(`Habit with ID ${id} not found`, 404);
    }
    return foundHabit;
  }

  async updateHabit(id: number, title?: string, description?: string, completed?: boolean, streak?: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    const habitToUpdate = await this.findHabitByIdRecursive(id, allHabits);

    if (!habitToUpdate) {
      throw new ApiError(`Habit with ID ${id} not found`, 404);
    }

    if (title) habitToUpdate.title = title;
    if (description) habitToUpdate.description = description;
    if (completed !== undefined) habitToUpdate.completed = completed;
    if (streak !== undefined) habitToUpdate.streak = streak;

    await this.writeHabits(allHabits);
    console.log(`Habit updated (ID: ${id}): ${habitToUpdate.title}`);
    return habitToUpdate;
  }

  async deleteHabit(id: number): Promise<void> {
    const allHabits = await this.readHabits();
    const deleteRecursive = (habits: Habit[]): boolean => {
      const index = habits.findIndex((h) => h.id === id);
      if (index !== -1) {
        habits.splice(index, 1);
        return true;
      }
      for (const habit of habits) {
        if (deleteRecursive(habit.subHabits)) return true;
      }
      return false;
    };

    if (!deleteRecursive(allHabits)) {
      throw new ApiError(`Habit with ID ${id} not found`, 404);
    }

    await this.writeHabits(allHabits);
    console.log(`Habit deleted (ID: ${id})`);
  }
}

export const habitManager = new HabitManager();