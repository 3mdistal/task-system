export interface ObsidianFile {
  path: string;
  folder: string;
  name: string;
  link: ObsidianLink;
  outlinks: ObsidianDataViewResult<ObsidianLink>;
  inlinks: ObsidianDataViewResult<ObsidianLink>;
  etags: ObsidianDataViewResult<string>;
  tags: ObsidianDataViewResult<string>;
  aliases: ObsidianDataViewResult<string>;
  lists: ObsidianDataViewResult<ObsidianListItem>;
  tasks: ObsidianDataViewResult<ObsidianTaskItem>;
  ctime: string;
  cday: string;
  mtime: string;
  mday: string;
  size: number;
  starred: boolean;
  frontmatter: Record<string, any>;
  ext: string;
}

export interface ObsidianLink {
  path: string;
  display?: string;
  type: string;
  embed?: boolean;
}

export interface ObsidianListItem {
  symbol: string;
  link: ObsidianLink;
  section: ObsidianLink;
  text: string;
  tags: string[];
  line: number;
  lineCount: number;
  list: number;
  outlinks: ObsidianLink[];
  path: string;
  children: ObsidianListItem[];
  task: boolean;
  annotated: boolean;
  position: {
    start: { line: number; col: number; offset: number };
    end: { line: number; col: number; offset: number };
  };
  subtasks: ObsidianListItem[];
  real: boolean;
  header?: ObsidianLink;
  parent?: number;
}

export interface ObsidianTaskItem extends ObsidianListItem {
  status?: string;
  checked?: boolean;
  completed?: boolean;
  fullyCompleted?: boolean;
}

export interface ObsidianGoal {
  name: string;
  id: string;
  type: "goal";
  status: string;
}

export interface ObsidianProject {
  name: string;
  id: string;
  type: "project";
  status: string;
  deadline?: string | null;
  deadlineType?: "soft" | "hard" | null;
  excitement?: number;
  viability?: number;
  goal?: ObsidianLink | null;
}

export interface ObsidianMilestone {
  name: string;
  id: string;
  type: "milestone";
  status: string;
  dependencies?: ObsidianLink[] | null;
  project: ObsidianLink;
}

export interface ObsidianTask {
  name: string;
  id: string;
  type: "task";
  status: string;
  duration?: number;
  dependencies?: ObsidianLink[] | null;
  milestone?: ObsidianLink | null;
  timeSpent?: number;
}

export interface ObsidianDataViewResult<T> {
  values: T[];
  settings: Record<string, any>;
  length: number;
}

export interface ObsidianDataViewData {
  goals: ObsidianDataViewResult<ObsidianGoal>;
  projects: ObsidianDataViewResult<ObsidianProject>;
  milestones: ObsidianDataViewResult<ObsidianMilestone>;
  tasks: ObsidianDataViewResult<ObsidianTask>;
}
