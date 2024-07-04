import { createClient } from "@/utils/supabase/server";

export async function GET(requset: Request) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cron-test")
    .insert({ text: "cron-test" });

  return Response.json("ok");
}
