import { calculateCrunchInfo } from "../../src/utils/crunchUtils";
import { Project } from "../../src/types";

describe("calculateCrunchInfo", () => {
  const baseDate = new Date("2023-05-01");

  it("should return zero values when there are no projects with deadlines", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Project 1",
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Project 2",
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: 0,
      latestCrunch: 0,
      averageCrunch: 0,
      crunchByProject: {},
    });
  });

  it("should calculate correct crunch info for projects with deadlines", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Project 1",
        deadline: new Date("2023-05-10"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Project 2",
        deadline: new Date("2023-05-15"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
      {
        id: "3",
        name: "Project 3",
        deadline: new Date("2023-05-05"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 5,
        viability: 5,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: 4,
      latestCrunch: 14,
      averageCrunch: 9,
      crunchByProject: {
        "Project 1": 9,
        "Project 2": 14,
        "Project 3": 4,
      },
    });
  });

  it("should handle projects with deadlines in the past", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Project 1",
        deadline: new Date("2023-04-30"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Project 2",
        deadline: new Date("2023-05-05"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: -1,
      latestCrunch: 4,
      averageCrunch: 2,
      crunchByProject: {
        "Project 1": -1,
        "Project 2": 4,
      },
    });
  });

  it("should handle a mix of projects with and without deadlines", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Project 1",
        deadline: new Date("2023-05-10"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Project 2",
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
      {
        id: "3",
        name: "Project 3",
        deadline: new Date("2023-05-15"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 5,
        viability: 5,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: 9,
      latestCrunch: 14,
      averageCrunch: 12,
      crunchByProject: {
        "Project 1": 9,
        "Project 3": 14,
      },
    });
  });

  it("should handle a single project with a deadline", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Single Project",
        deadline: new Date("2023-05-10"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: 9,
      latestCrunch: 9,
      averageCrunch: 9,
      crunchByProject: {
        "Single Project": 9,
      },
    });
  });

  it("should handle projects with the same deadline", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Project 1",
        deadline: new Date("2023-05-10"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Project 2",
        deadline: new Date("2023-05-10"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result).toEqual({
      earliestCrunch: 9,
      latestCrunch: 9,
      averageCrunch: 9,
      crunchByProject: {
        "Project 1": 9,
        "Project 2": 9,
      },
    });
  });

  it("should handle a large number of projects", () => {
    const projects: Project[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Project ${i + 1}`,
      deadline: new Date(`2023-05-${(i % 30) + 1}`),
      milestoneIds: [],
      status: "in-flight",
      excitement: 3,
      viability: 3,
      type: "project",
    }));

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result.earliestCrunch).toBeGreaterThanOrEqual(0);
    expect(result.latestCrunch).toBeLessThanOrEqual(30);
    expect(result.averageCrunch).toBeGreaterThan(0);
    expect(Object.keys(result.crunchByProject).length).toBe(1000);
  });

  it("should handle extreme date values", () => {
    const projects: Project[] = [
      {
        id: "1",
        name: "Far Future Project",
        deadline: new Date("2100-01-01"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 3,
        viability: 3,
        type: "project",
      },
      {
        id: "2",
        name: "Far Past Project",
        deadline: new Date("1900-01-01"),
        milestoneIds: [],
        status: "in-flight",
        excitement: 4,
        viability: 4,
        type: "project",
      },
    ];

    const result = calculateCrunchInfo(projects, baseDate);

    expect(result.earliestCrunch).toBeLessThan(0);
    expect(result.latestCrunch).toBeLessThanOrEqual(3650); // 10 years maximum
    expect(result.averageCrunch).toBeGreaterThanOrEqual(0);
    expect(Object.keys(result.crunchByProject).length).toBe(2);
  });
});
