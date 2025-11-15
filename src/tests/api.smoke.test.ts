import fetch from "node-fetch";

test("health of cron tick", async () => {
  const res = await fetch("http://localhost:3000/api/cron-tick");
  expect(res.status).toBeLessThan(500);
});
