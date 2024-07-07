import { simulateSequence } from "./services/simulationService";
import { optimizeSequence } from "./services/optimizationService";
import { Milestone, Task } from "./types";
import {
  MS_PER_DAY,
  getDaysUntilDeadline,
  getHoursUntilDeadline,
} from "./utils/dateUtils";
import {
  calculateTotalDuration,
  calculateDeadlineRatio,
  getTasksForMilestone,
} from "./utils/calculationUtils";

// Define your tasks and milestones here
export const tasks: Task[] = [
  {
    name: "Design user interface mockups",
    duration: 4.5,
    milestone: "Frontend Redesign",
  },
  {
    name: "Implement authentication system",
    duration: 8,
    milestone: "Backend Security",
  },
  {
    name: "Write user documentation",
    duration: 6,
    milestone: "Product Launch",
  },
  {
    name: "Optimize database queries",
    duration: 3.5,
    milestone: "Performance Improvements",
  },
  {
    name: "Conduct user testing",
    duration: 5,
    milestone: "Quality Assurance",
  },
  {
    name: "Integrate payment gateway",
    duration: 7,
    milestone: "E-commerce Features",
  },
  {
    name: "Create marketing materials",
    duration: 5,
    milestone: "Product Launch",
  },
  {
    name: "Implement responsive design",
    duration: 5,
    milestone: "Frontend Redesign",
  },
  {
    name: "Set up continuous integration",
    duration: 3,
    milestone: "DevOps Improvements",
  },
  {
    name: "Develop API endpoints",
    duration: 8.5,
    milestone: "Backend Development",
  },
  {
    name: "Create data backup system",
    duration: 5,
    milestone: "Backend Security",
  },
  {
    name: "Design logo",
    duration: 2.5,
    hard_deadline: "2024-09-30",
  },
  {
    name: "Implement search functionality",
    duration: 6,
    milestone: "Feature Enhancements",
  },
  {
    name: "Conduct security audit",
    duration: 4,
    milestone: "Backend Security",
  },
  {
    name: "Optimize image loading",
    duration: 4.5,
    milestone: "Performance Improvements",
  },
  {
    name: "Implement user feedback system",
    duration: 5.5,
    milestone: "Feature Enhancements",
  },
  {
    name: "Create admin dashboard",
    duration: 7,
    milestone: "Backend Development",
  },
  {
    name: "Write unit tests",
    duration: 8,
    milestone: "Quality Assurance",
  },
  {
    name: "Implement localization",
    duration: 4.5,
    milestone: "Feature Enhancements",
  },
  {
    name: "Prepare pitch deck",
    duration: 3,
    soft_deadline: "2024-08-31",
  },
];

export const milestones: Milestone[] = [
  {
    name: "Frontend Redesign",
    viability: 4,
    excitement: 5,
    soft_deadline: "2024-09-15",
    project: "Website Overhaul",
  },
  {
    name: "Backend Security",
    viability: 3,
    excitement: 3,
    hard_deadline: "2024-08-31",
    project: "Website Overhaul",
  },
  {
    name: "Product Launch",
    viability: 4,
    excitement: 5,
    hard_deadline: "2024-12-01",
    project: "Website Overhaul",
  },
  {
    name: "Performance Improvements",
    viability: 4,
    excitement: 4,
    soft_deadline: "2024-10-31",
    project: "Website Overhaul",
  },
  {
    name: "Quality Assurance",
    viability: 5,
    excitement: 3,
    soft_deadline: "2024-11-15",
    project: "Website Overhaul",
  },
  {
    name: "E-commerce Features",
    viability: 3,
    excitement: 4,
    hard_deadline: "2024-09-30",
    project: "Website Overhaul",
  },
  {
    name: "DevOps Improvements",
    viability: 3,
    excitement: 3,
    project: "Infrastructure Upgrade",
    soft_deadline: "2025-01-15",
  },
  {
    name: "Backend Development",
    viability: 4,
    excitement: 4,
    soft_deadline: "2024-10-31",
    project: "Website Overhaul",
  },
  {
    name: "Feature Enhancements",
    viability: 3,
    excitement: 4,
    hard_deadline: "2024-11-15",
    project: "Website Overhaul",
  },
];

// Main execution
const bestSequence = optimizeSequence(milestones);
const bestSequenceData = simulateSequence(bestSequence);

const projectStartDate = new Date();
const projectDuration = Math.round(
  (bestSequenceData.projectEndDate.getTime() - projectStartDate.getTime()) /
    MS_PER_DAY
);

console.log("Best Sequence Data:");
console.log(
  `Weighted Average Ratio: ${bestSequenceData.weightedAverageRatio.toFixed(2)}`
);
console.log(`Total Days Late: ${bestSequenceData.totalDaysLate}`);
console.log(`Total Project Duration: ${projectDuration} days`);

console.log("\nLate Milestones:");
bestSequenceData.milestonesLate.forEach((lateMilestone) => {
  console.log(
    `- ${lateMilestone.milestone.name}: ${lateMilestone.daysLate} days late`
  );
});

console.log("\nEarly Milestones:");
bestSequenceData.milestonesEarly.forEach((earlyMilestone) => {
  console.log(
    `- ${earlyMilestone.milestone.name}: ${earlyMilestone.daysEarly} days early`
  );
});

console.log(
  `\nSummary: ${bestSequenceData.milestonesEarly.length} milestones early, ${bestSequenceData.milestonesLate.length} milestones late`
);

const lastMilestone = bestSequence[bestSequence.length - 1];
const lastDeadline = new Date(
  lastMilestone.hard_deadline || lastMilestone.soft_deadline || ""
);

console.log("\nOverall Project Status:");
if (!isNaN(lastDeadline.getTime())) {
  const daysFromDeadline = Math.round(
    (lastDeadline.getTime() - bestSequenceData.projectEndDate.getTime()) /
      MS_PER_DAY
  );
  if (daysFromDeadline > 0) {
    console.log(
      `The project is estimated to finish ${daysFromDeadline} days early.`
    );
  } else if (daysFromDeadline < 0) {
    console.log(
      `The project is estimated to finish ${-daysFromDeadline} days late.`
    );
  } else {
    console.log("The project is estimated to finish exactly on time.");
  }
} else {
  console.log(
    "Unable to determine overall project status due to missing deadline on the last milestone."
  );
}

// Output the first milestone to work on
const firstMilestone = bestSequence[0];
console.log("\nNext milestone to work on:");
console.log(`Name: ${firstMilestone.name}`);
console.log(`Project: ${firstMilestone.project}`);
console.log(`Viability: ${firstMilestone.viability}`);
console.log(`Excitement: ${firstMilestone.excitement}`);
if (firstMilestone.hard_deadline) {
  console.log(`Hard Deadline: ${firstMilestone.hard_deadline}`);
} else if (firstMilestone.soft_deadline) {
  console.log(`Soft Deadline: ${firstMilestone.soft_deadline}`);
}

// Output tasks for the first milestone
const tasksForFirstMilestone = getTasksForMilestone(firstMilestone);
console.log("\nTasks for this milestone:");
tasksForFirstMilestone.forEach((task, index) => {
  console.log(`${index + 1}. ${task.name} (Duration: ${task.duration} hours)`);
});

// Calculate and output time information
const totalDuration = calculateTotalDuration(tasksForFirstMilestone);
const daysUntilDeadline = getDaysUntilDeadline(firstMilestone);
const hoursUntilDeadline = getHoursUntilDeadline(firstMilestone, new Date());
const deadlineRatio = calculateDeadlineRatio(firstMilestone, new Date());

console.log(`\nTotal duration: ${totalDuration} hours`);
console.log(`Days until deadline: ${daysUntilDeadline}`);
console.log(`Hours until deadline: ${hoursUntilDeadline}`);
console.log(`Deadline ratio: ${deadlineRatio.toFixed(2)}`);
