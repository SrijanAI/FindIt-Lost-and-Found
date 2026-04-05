import { z } from "zod";

export const itemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.enum([
    "electronics", "documents", "clothing", "accessories",
    "keys", "bags", "bottles", "books", "other",
  ]),
  tags: z.array(z.string()).min(1, "Add at least one tag").max(10),
  date_occurred: z.string().min(1, "Date is required"),
  location_name: z.string().min(2, "Location is required"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  college_name: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
});
