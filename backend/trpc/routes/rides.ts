import * as z from "zod";
import { createTRPCRouter, protectedProcedure } from "../create-context";

interface Ride {
  id: string;
  userId: string;
  trailId?: string;
  startTime: string;
  endTime?: string;
  stats: {
    distance: number;
    duration: number;
    elevationGain: number;
    maxSpeed: number;
    avgSpeed: number;
  };
  coordinates: {
    latitude: number;
    longitude: number;
    timestamp: number;
    speed: number;
    altitude: number;
  }[];
}

const rides = new Map<string, Ride>();

export const ridesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      trailId: z.string().optional(),
      startTime: z.string(),
    }))
    .mutation(({ input, ctx }) => {
      const ride: Ride = {
        id: Date.now().toString(),
        userId: ctx.userId,
        trailId: input.trailId,
        startTime: input.startTime,
        stats: {
          distance: 0,
          duration: 0,
          elevationGain: 0,
          maxSpeed: 0,
          avgSpeed: 0,
        },
        coordinates: [],
      };

      rides.set(ride.id, ride);
      return ride;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      endTime: z.string().optional(),
      stats: z.object({
        distance: z.number(),
        duration: z.number(),
        elevationGain: z.number(),
        maxSpeed: z.number(),
        avgSpeed: z.number(),
      }).optional(),
      coordinates: z.array(z.object({
        latitude: z.number(),
        longitude: z.number(),
        timestamp: z.number(),
        speed: z.number(),
        altitude: z.number(),
      })).optional(),
    }))
    .mutation(({ input, ctx }) => {
      const ride = rides.get(input.id);
      if (!ride || ride.userId !== ctx.userId) {
        throw new Error("Ride not found");
      }

      const updated: Ride = {
        ...ride,
        ...(input.endTime && { endTime: input.endTime }),
        ...(input.stats && { stats: input.stats }),
        ...(input.coordinates && { coordinates: input.coordinates }),
      };

      rides.set(ride.id, updated);
      return updated;
    }),

  list: protectedProcedure
    .query(({ ctx }) => {
      return Array.from(rides.values())
        .filter(r => r.userId === ctx.userId)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      const ride = rides.get(input.id);
      if (!ride || ride.userId !== ctx.userId) {
        throw new Error("Ride not found");
      }
      return ride;
    }),
});
