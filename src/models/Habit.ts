// models/Habit.ts

export class Habit {
  readonly id: number;
  title: string;
  description: string;
  completed: boolean = false;
  streak: number = 0;
  subHabits: Habit[] = [];

  constructor(id: number, title: string, description: string) {
    this.id = id;
    this.title = title;
    this.description = description;
  }

  // Add a sub-habit (for recursive habits)
  addSubHabit(subHabit: Habit) {
    this.subHabits.push(subHabit);
  }

  // Display habit info in terminal with indentation for sub-habits
  display(indent = 0) {
    console.log(
      `${' '.repeat(indent)}- [${this.completed ? 'x' : ' '}] ${this.title} (Streak: ${this.streak})`
    );
    this.subHabits.forEach((sub) => sub.display(indent + 2));
  }
}