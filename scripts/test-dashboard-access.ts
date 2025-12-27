import fetch from "node-fetch";

async function testDashboard() {
  console.log("\n=== DASHBOARD ACCESS TEST ===\n");

  // 1. Login to get cookie
  console.log("1. Logging in...");
  const loginResponse = await fetch("http://localhost:3000/api/cms/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "mustafa-1234" }),
  });

  if (!loginResponse.ok) {
    console.log("✗ Login failed:", loginResponse.status);
    return;
  }

  const cookies = loginResponse.headers.get("set-cookie");
  console.log("✓ Login successful");
  console.log("  Cookie:", cookies?.substring(0, 50) + "...");

  if (!cookies) {
    console.log("✗ No cookie received");
    return;
  }

  // 2. Test /cms (should redirect to /cms/dashboard)
  console.log("\n2. Testing /cms...");
  const cmsResponse = await fetch("http://localhost:3000/cms", {
    headers: { Cookie: cookies },
    redirect: "manual",
  });
  console.log("  Status:", cmsResponse.status);
  if (cmsResponse.status === 307 || cmsResponse.status === 308) {
    const location = cmsResponse.headers.get("location");
    console.log("  → Redirect to:", location);
  }

  // 3. Test /cms/dashboard directly
  console.log("\n3. Testing /cms/dashboard...");
  const dashboardResponse = await fetch("http://localhost:3000/cms/dashboard", {
    headers: { Cookie: cookies },
  });
  console.log("  Status:", dashboardResponse.status);
  if (dashboardResponse.ok) {
    const html = await dashboardResponse.text();
    if (html.includes("Dashboard") || html.includes("Panel")) {
      console.log("  ✓ Dashboard page loaded!");
    } else {
      console.log("  ? Page loaded but content unclear");
    }
  }

  // 4. Test API endpoint
  console.log("\n4. Testing /api/cms/dashboard...");
  const apiResponse = await fetch("http://localhost:3000/api/cms/dashboard", {
    headers: { Cookie: cookies },
  });
  console.log("  Status:", apiResponse.status);
  if (apiResponse.ok) {
    const data = await apiResponse.json();
    console.log("  ✓ API response:");
    console.log("    Total leads:", data.totals?.total);
    console.log("    Last 7d:", data.totals?.last7d);
    console.log("    Open:", data.totals?.open);
  }

  console.log("\n=== TEST COMPLETE ===\n");
}

testDashboard().catch((e) => {
  console.error("Test error:", e.message);
  process.exit(1);
});
