import { ActivityLogsContainer } from "@/features/database/cosmos-containers"
import { uniqueId } from "@/lib/utils"

interface ActivityLog<T = unknown> {
  id: string
  operation: "CREATE" | "UPDATE" | "DELETE"
  entity: { id: string; type: string } & Record<string, unknown>
  activity: T
  userId: string
  timestamp: string
}

type ActivityTrackingServiceType = {
  logActivity: <T>(
    operation: "CREATE" | "UPDATE" | "DELETE",
    entity: { id: string; type: string } & Record<string, unknown>,
    activity: T,
    userId: string
  ) => Promise<void>
}
function ActivityTrackingService(): ActivityTrackingServiceType {
  const logActivity: ActivityTrackingServiceType["logActivity"] = async (operation, entity, activity, userId) => {
    const activityLog: ActivityLog = {
      id: uniqueId(),
      userId,
      entity,
      timestamp: new Date().toISOString(),
      operation,
      activity,
    }

    await saveActivityLog(activityLog)
  }

  const saveActivityLog = async <T>(activityLog: ActivityLog<T>): Promise<void> => {
    const container = await ActivityLogsContainer()
    await container.items.upsert(activityLog)
  }

  return { logActivity }
}

export const activityTrackingService = ActivityTrackingService()
