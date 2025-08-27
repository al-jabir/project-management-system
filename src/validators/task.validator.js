import { z } from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Task title is required",
      })
      .min(3, "Title must be at least 3 characters"),
    description: z
      .string({
        required_error: "Task description is required",
      })
      .min(10, "Description must be at least 10 characters"),
    projectId: z.string({
      required_error: "Project ID is required",
    }),
    assigneeId: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string({
      required_error: "Task ID is required",
    }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .optional(),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .optional(),
      status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
      assigneeId: z.string().nullable().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
      dueDate: z.string().datetime().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const createSubtaskSchema = z.object({
  params: z.object({
    taskId: z.string({
      required_error: "Task ID is required",
    }),
  }),
  body: z.object({
    title: z
      .string({
        required_error: "Subtask title is required",
      })
      .min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
  }),
});

export const updateSubtaskSchema = z.object({
  params: z.object({
    taskId: z.string({
      required_error: "Task ID is required",
    }),
    subtaskId: z.string({
      required_error: "Subtask ID is required",
    }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .optional(),
      description: z.string().optional(),
      isCompleted: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});
