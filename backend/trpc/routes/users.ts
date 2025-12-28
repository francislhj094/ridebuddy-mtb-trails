import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const users = new Map<string, User & { password: string }>();

export const usersRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(z.object({ 
      email: z.string().email(), 
      password: z.string().min(6),
      name: z.string() 
    }))
    .mutation(({ input }) => {
      const existingUser = Array.from(users.values()).find(u => u.email === input.email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      const user: User & { password: string } = {
        id: Date.now().toString(),
        email: input.email,
        name: input.name,
        password: input.password,
        createdAt: new Date().toISOString()
      };

      users.set(user.id, user);

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token: user.id };
    }),

  signIn: publicProcedure
    .input(z.object({ 
      email: z.string().email(), 
      password: z.string() 
    }))
    .mutation(({ input }) => {
      const user = Array.from(users.values()).find(
        u => u.email === input.email && u.password === input.password
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token: user.id };
    }),

  getMe: protectedProcedure
    .query(({ ctx }) => {
      const user = users.get(ctx.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),
});
