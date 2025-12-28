import { createTRPCRouter } from "./create-context";
import { usersRouter } from "./routes/users";
import { ridesRouter } from "./routes/rides";
import { trailsRouter } from "./routes/trails";
import { bookmarksRouter } from "./routes/bookmarks";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  rides: ridesRouter,
  trails: trailsRouter,
  bookmarks: bookmarksRouter,
});

export type AppRouter = typeof appRouter;
