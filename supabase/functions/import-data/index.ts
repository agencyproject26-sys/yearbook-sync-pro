import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .in("role", ["admin", "owner"]);

    if (!callerRoles || callerRoles.length === 0) {
      return new Response(JSON.stringify({ error: "Admin/Owner access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { tables, dry_run = false } = body;

    if (!tables || typeof tables !== "object") {
      return new Response(JSON.stringify({ error: "Invalid format. Expected { tables: { table_name: [...rows] } }" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Import order matters due to foreign keys
    const importOrder = [
      "company_settings",
      "customers",
      "orders",
      "invoices",
      "payments",
      "salaries",
      "calendar_events",
      "profiles",
      "user_roles",
    ];

    const results: Record<string, { count: number; status: string; error?: string }> = {};

    if (dry_run) {
      for (const table of importOrder) {
        const rows = tables[table];
        if (!rows || !Array.isArray(rows)) {
          results[table] = { count: 0, status: "skipped" };
          continue;
        }
        results[table] = { count: rows.length, status: "would_import" };
      }

      return new Response(JSON.stringify({
        mode: "dry_run",
        results,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const table of importOrder) {
      const rows = tables[table];
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        results[table] = { count: 0, status: "skipped" };
        continue;
      }

      try {
        // Upsert in batches of 500
        const batchSize = 500;
        let imported = 0;

        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const { error } = await supabaseAdmin
            .from(table)
            .upsert(batch, { onConflict: "id", ignoreDuplicates: false });

          if (error) throw error;
          imported += batch.length;
        }

        results[table] = { count: imported, status: "success" };
      } catch (err) {
        results[table] = { count: 0, status: "error", error: err.message };
      }
    }

    return new Response(JSON.stringify({
      mode: "import",
      imported_at: new Date().toISOString(),
      imported_by: caller.email,
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
