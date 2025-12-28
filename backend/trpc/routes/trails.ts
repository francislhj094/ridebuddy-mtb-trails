import * as z from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context";

interface Trail {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';
  distance: number;
  elevationGain: number;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
  photos: string[];
  rating: number;
  ratingCount: number;
  condition: 'Open' | 'Muddy' | 'Closed';
  userRatings: { [userId: string]: number };
}

const trails = new Map<string, Trail>();

export const trailsRouter = createTRPCRouter({
  list: publicProcedure
    .query(() => {
      return Array.from(trails.values());
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const trail = trails.get(input.id);
      if (!trail) {
        throw new Error("Trail not found");
      }
      return trail;
    }),

  rate: protectedProcedure
    .input(z.object({
      trailId: z.string(),
      rating: z.number().min(1).max(5),
    }))
    .mutation(({ input, ctx }) => {
      const trail = trails.get(input.trailId);
      if (!trail) {
        throw new Error("Trail not found");
      }

      const oldRating = trail.userRatings[ctx.userId];
      trail.userRatings[ctx.userId] = input.rating;

      if (oldRating) {
        const totalRating = trail.rating * trail.ratingCount - oldRating + input.rating;
        trail.rating = totalRating / trail.ratingCount;
      } else {
        const totalRating = trail.rating * trail.ratingCount + input.rating;
        trail.ratingCount += 1;
        trail.rating = totalRating / trail.ratingCount;
      }

      trails.set(input.trailId, trail);
      return trail;
    }),

  updateCondition: protectedProcedure
    .input(z.object({
      trailId: z.string(),
      condition: z.enum(['Open', 'Muddy', 'Closed']),
    }))
    .mutation(({ input }) => {
      const trail = trails.get(input.trailId);
      if (!trail) {
        throw new Error("Trail not found");
      }

      trail.condition = input.condition;
      trails.set(input.trailId, trail);
      return trail;
    }),

  sync: publicProcedure
    .input(z.array(z.object({
      id: z.string(),
      name: z.string(),
      difficulty: z.enum(['Easy', 'Intermediate', 'Advanced', 'Expert']),
      distance: z.number(),
      elevationGain: z.number(),
      description: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      image: z.string(),
      photos: z.array(z.string()),
      rating: z.number(),
      ratingCount: z.number(),
      condition: z.enum(['Open', 'Muddy', 'Closed']),
      userRatings: z.record(z.string(), z.number()).optional(),
    })))
    .mutation(({ input }) => {
      input.forEach(trail => {
        if (!trails.has(trail.id)) {
          trails.set(trail.id, {
            ...trail,
            userRatings: trail.userRatings || {},
          });
        }
      });
      return { success: true, count: input.length };
    }),
});
