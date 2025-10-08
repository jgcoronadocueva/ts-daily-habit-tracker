// models/Habit.ts

/**
 * Represents a Habit with title, description, completion status, and streak.
 * Supports nested sub-habits and can display itself in the terminal.
 */
export class Habit {
  readonly id: number;
  title: string;
  description: string;
  completed: boolean = false;
  streak: number = 0;
  subHabits: Habit[] = [];

  // Create a new Habit instance
  constructor(id: number, title: string, description: string) {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  // ===============================
  // Add a sub-habit
  // Allows nesting of habits under this habit
  // ===============================
  addSubHabit(subHabit: Habit) {
    this.subHabits.push(subHabit);
  }

  // ===============================
  // Display habit information
  // Prints habit title, completion, and streak to the console
  // ===============================
  display(indent = 0) {
    // Print main habit info with indentation
    console.log(
      `${' '.repeat(indent)}- [${this.completed ? 'x' : ' '}] ${this.title} (Streak: ${this.streak})`
    );

    // Recursively display sub-habits with extra indentation
    this.subHabits.forEach((sub) => sub.display(indent + 2));
  }
}