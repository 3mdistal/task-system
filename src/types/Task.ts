export interface Task {
  name: string;
  duration: number;
  milestone?: string;
  soft_deadline?: string;
  hard_deadline?: string;
}
