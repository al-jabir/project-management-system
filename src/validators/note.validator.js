import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Note title is required",
      })
      .min(3, "Title must be at least 3 characters"),
    content: z
      .string({
        required_error: "Note content is required",
      })
      .min(10, "Content must be at least 10 characters"),
    projectId: z.string({
      required_error: "Project ID is required",
    }),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    noteId: z.string({
      required_error: "Note ID is required",
    }),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .optional(),
      content: z
        .string()
        .min(10, "Content must be at least 10 characters")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});
