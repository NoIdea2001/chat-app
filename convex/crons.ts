import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Every minute, mark users as offline if their heartbeat is stale
crons.interval(
    "clean stale online statuses",
    { seconds: 60 },
    internal.users.cleanStaleOnlineStatuses
);

export default crons;
