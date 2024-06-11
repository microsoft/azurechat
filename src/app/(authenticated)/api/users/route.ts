import { getAllDepartments } from "@/features/persona-page/persona-services/persona-service";

export async function GET(req: Request) {
  return await getAllDepartments(req);
}
