import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

async function main() {
  // Elimina il contenuto di test
  const { data: before, error: beforeErr } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", "test_content")
    .single();

  if (beforeErr) {
    console.log("PRIMA dell'eliminazione:");
    if (beforeErr.code === "PGRST116") {
      console.log("  key=test_content NON esiste (nessun errore necessario)");
    } else {
      console.log("  Errore lettura:", beforeErr.message);
    }
  } else {
    console.log("PRIMA dell'eliminazione:");
    console.log("  Trovato:", JSON.stringify(before));
  }

  // Delete
  const { error: delErr } = await supabase
    .from("site_content")
    .delete()
    .eq("key", "test_content");

  if (delErr) {
    console.log("ERRORE durante eliminazione:", delErr.message);
    process.exit(1);
  }
  console.log("\nELIMINAZIONE: OK (test_content cancellato)");

  // Verify absence
  const { data: after, error: afterErr } = await supabase
    .from("site_content")
    .select("key")
    .eq("key", "test_content")
    .maybeSingle();

  console.log("\nVERIFICA assenza key:");
  if (afterErr) {
    console.log("  Errore verifica:", afterErr.message);
    process.exit(1);
  }
  if (after === null) {
    console.log("  CONFIRMATO: test_content NON è più presente");
  } else {
    console.log("  FAIL: test_content è ancora presente:", JSON.stringify(after));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
