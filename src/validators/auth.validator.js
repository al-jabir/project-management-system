import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Email is invalid"),
    username: z
      .string({
        required_error: "Username is required",
      })
      .min(3, "Username must be at least 3 characters long")
      .regex(
        /^[a-z0-9_-]+$/,
        "Username must be lowercase and can only contain letters, numbers, underscores, and hyphens",
      ),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
    fullName: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Email is invalid"),
    password: z.string({
      required_error: "Password is required",
    }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "Old password is required",
    }),
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Email is invalid"),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    resetToken: z.string({
      required_error: "Reset token is required",
    }),
  }),
  body: z.object({
    newPassword: z
      .string({
        required_error: "New password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
  }),
});
