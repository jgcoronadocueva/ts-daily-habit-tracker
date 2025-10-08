import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { Habit } from '../models/Habit.js';
import { ApiError } from '../middleware/errorHandler.js';

// Get the absolute path to the habits.json file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'habits.json'); 

/**
 * HabitManager handles CRUD operations for Habit objects.
 * Stores habits in a JSON file and supports nested sub-habits.
 */
class HabitManager {
  private isWriting = false; // Lock to prevent multiple writes

  // ===============================
  // Acquire write lock
  // ===============================
  private async acquireLock(): Promise<void> {

    // Wait until no other operation is writing, then lock
    while (this.isWriting) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.isWriting = true; 
  }

  // ===============================
  // Release write lock
  // ===============================
  private releaseLock(): void {
    this.isWriting = false;
  }

  // ===============================
  // Read all habits from JSON file
  // Returns an array of Habit instances
  // ===============================
  private async readHabits(): Promise<Habit[]> {
    const data = await fs.readFile(DATA_FILE, 'utf8').catch(err => {
      // If the file doesn't exist, treat it as empty
      if ((err as any).code === 'ENOENT') return '';
      throw new ApiError('Failed to read habits file', 500);
    });
    
    // If file is empty, return an empty array
    if (data.trim() === '') return [];

    // Parse JSON and rebuild Habit instances
    const habitsData = JSON.parse(data);
    return habitsData.map((h: any) => {
      // Create a new Habit object using its main properties
      const habit = new Habit(h.id, h.title, h.description);
      // Copy all stored fields from the JSON object into the new Habit instance.
      Object.assign(habit, h);
      return habit;
    });
  }
  

  // ===============================
  // Write habits to JSON file safely
  // Uses a lock to avoid simultaneous writes
  // ===============================
  private async writeHabits(habits: Habit[]): Promise<void> {
    await this.acquireLock();
    try {
      const data = JSON.stringify(habits, null, 2); //Format the JSON string
      await fs.writeFile(DATA_FILE, data, 'utf8'); // Save to file
      console.log('Successfully wrote data to file.');
    } catch (err) {
      console.error('Failed to write to habits.json:', err);
      throw new ApiError('Failed to save habits data.', 500);
    } finally {
      this.releaseLock(); // Always release the lock
    }
  }
  
  // ===============================
  // Recursively find a habit by ID
  // Includes nested sub-habits
  // Returns Habit instance or undefined
  // ===============================
  private async findHabitRecursive(id: number, habits: Habit[]): Promise<Habit | undefined> {
    for (const habit of habits) {
      // Check if current habit matches the ID
      if (habit.id === id) {
        return habit;
      }

      // If current habit has sub-habits, search recursively
      if (habit.subHabits && habit.subHabits.length > 0) {
        const subHabit = await this.findHabitRecursive(id, habit.subHabits);
        if (subHabit) {
          return subHabit;
        }
      }
    }

    // Return undefined if habit not found in this branch
    return undefined;
  }

// ===============================
// Recursively delete a habit by ID
// Searches nested sub-habits and removes the habit from its array
// Returns true if a habit was deleted, false otherwise
// ===============================
  private deleteHabitRecursive(habits: Habit[], id: number): boolean {
    // Try to find the habit at the current level
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      // Remove habit from array if found
      habits.splice(index, 1);
      return true;
    }

    // If current habit has sub-habits, delete recursively
    for (const habit of habits) {
      if (this.deleteHabitRecursive(habit.subHabits, id)) return true;
    }

    return false; // Habit was not found in this branch
  }

  // ===============================
  // Generate a unique habit ID sequentially
  // Checks all habits and sub-habits to ensure unique IDs
  // ===============================
  private getNextId(habits: Habit[]): number {
    const findMaxId = (h: Habit[]): number => {
      let maxId = 0;
      h.forEach(habit => {
        // Compare habit's ID and max ID found in sub-habits
        maxId = Math.max(maxId, habit.id, findMaxId(habit.subHabits));
      });
      return maxId;
    };
    return findMaxId(habits) + 1;
  }

  // ===============================
  // Create a new habit
  // Adds habit at root level or as a sub-habit
  // ===============================
  async createHabit(title: string, description: string, parentId?: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    
    // Create new Habit instance with unique ID
    const newHabit = new Habit(this.getNextId(allHabits), title, description);
    
    if (parentId) {

      // Find the parent habit in the current list
      const parentHabit = await this.findHabitRecursive(parentId, allHabits); 

      if (!parentHabit) throw new ApiError(`Parent with ID ${parentId} not found`, 404);
    
      // Add new habit as a sub-habit
      parentHabit.addSubHabit(newHabit);
    } else {
      // Add new habit at root level (main habit)
      allHabits.push(newHabit);
    }
    
    // Save updated habits list
    await this.writeHabits(allHabits);
    console.log('Habit created:', newHabit.title);
    
    return newHabit;
  }

  // ===============================
  // Get all habits
  // Reads all habits and displays them in console
  // ===============================
  async getHabits(): Promise<Habit[]> {
    const habits = await this.readHabits();

    // Display each habit
    habits.forEach(h => h.display());

    return habits;
  }

  // ===============================
  // Get a single habit by ID
  // Searches through all habits to see if they have sub-habits
  // ===============================
  async getHabitById(id: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    const foundHabit = await this.findHabitRecursive(id, allHabits);

    if (!foundHabit) throw new ApiError(`Habit with ID ${id} not found`, 404);

    return foundHabit;
  }

  // ===============================
  // Update a habit's properties
  // Updates title, description, completion status, and streak
  // ===============================

  async updateHabit(id: number, title?: string, description?: string, completed?: boolean, streak?: number): Promise<Habit> {
    const allHabits = await this.readHabits();
    const habitToUpdate = await this.findHabitRecursive(id, allHabits);

    if (!habitToUpdate) throw new ApiError(`Habit with ID ${id} not found`, 404);

    // Update only provided fields
    if (title) habitToUpdate.title = title;
    if (description) habitToUpdate.description = description;
    if (completed !== undefined) habitToUpdate.completed = completed;
    if (streak !== undefined) habitToUpdate.streak = streak;

    // Save updated habits list
    await this.writeHabits(allHabits);
    console.log(`Habit updated (ID: ${id}): ${habitToUpdate.title}`);
    
    return habitToUpdate;
  }

  // ===============================
  // Delete a habit by ID
  // Removes a habit and sub-habits, if exist
  // ===============================
  async deleteHabit(id: number): Promise<void> {
    const allHabits = await this.readHabits();
    const deleted = this.deleteHabitRecursive(allHabits, id);

    if (!deleted) throw new ApiError(`Habit with ID ${id} not found`, 404);
    
    // Save updated habits list
    await this.writeHabits(allHabits);
    console.log(`Habit deleted (ID: ${id})`);
  }
}

export const habitManager = new HabitManager();