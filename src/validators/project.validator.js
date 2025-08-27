import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Project name is required",
      })
      .min(3, "Project name must be at least 3 characters"),
    description: z
      .string({
        required_error: "Project description is required",
      })
      .min(10, "Description must be at least 10 characters"),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: z.string({
      required_error: "Project ID is required",
    }),
  }),
  body: z
    .object({
      name: z
        .string()
        .min(3, "Project name must be at least 3 characters")
        .optional(),
      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const addMemberSchema = z.object({
  params: z.object({
    projectId: z.string({
      required_error: "Project ID is required",
    }),
  }),
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),
    role: z.enum(["ADMIN", "PROJECT_ADMIN", "MEMBER"]).optional(),
  }),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    projectId: z.string({
      required_error: "Project ID is required",
    }),
    memberId: z.string({
      required_error: "Member ID is required",
    }),
  }),
  body: z.object({
    role: z.enum(["ADMIN", "PROJECT_ADMIN", "MEMBER"], {
      required_error: "Role is required",
    }),
  }),
});
