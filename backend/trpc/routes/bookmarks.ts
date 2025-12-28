import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const bookmarks = new Map<string, Set<string>>();

export const bookmarksRouter = createTRPCRouter({
  list: protectedProcedure
    .query(({ ctx }) => {
      const userBookmarks = bookmarks.get(ctx.userId) || new Set();
      return Array.from(userBookmarks);
    }),

  add: protectedProcedure
    .input(z.object({ trailId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (!bookmarks.has(ctx.userId)) {
        bookmarks.set(ctx.userId, new Set());
      }
      bookmarks.get(ctx.userId)!.add(input.trailId);
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ trailId: z.string() }))
    .mutation(({ input, ctx }) => {
      const userBookmarks = bookmarks.get(ctx.userId);
      if (userBookmarks) {
        userBookmarks.delete(input.trailId);
      }
      return { success: true };
    }),

  toggle: protectedProcedure
    .input(z.object({ trailId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (!bookmarks.has(ctx.userId)) {
        bookmarks.set(ctx.userId, new Set());
      }
      
      const userBookmarks = bookmarks.get(ctx.userId)!;
      if (userBookmarks.has(input.trailId)) {
        userBookmarks.delete(input.trailId);
        return { bookmarked: false };
      } else {
        userBookmarks.add(input.trailId);
        return { bookmarked: true };
      }
    }),
});
