export type SchedulerWorkerRequest =
    | { type: "init" }
    | { type: "refresh"; taskId?: number }
    | { type: "trigger"; taskId: number };

export type SchedulerWorkerResponse =
    | { type: "log"; message: string }
    | { type: "error"; message: string }
    | { type: "triggerSuccess"; taskId: number }
    | { type: "triggerError"; taskId: number; message: string };
