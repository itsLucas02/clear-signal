import Workspace from "@/components/workspace";
import { getWorkspace } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getWorkspace();
  return <Workspace initialData={data} />;
}
