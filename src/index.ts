export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    /* =========================
       OAUTH CALLBACK
    ========================= */
    if (url.pathname === "/oauth/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("No code", { status: 400 });
      }

      // Intercambiar code por token
      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Accept": "application/json"
          },
          body: new URLSearchParams({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code
          })
        }
      );

      const tokenData = await tokenRes.json();
      const token = tokenData.access_token;

      if (!token) {
        return new Response("Token failed", { status: 500 });
      }

      // Obtener repositorios
      const reposRes = await fetch(
        "https://api.github.com/user/repos?per_page=100",
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "User-Agent": "gitquick"
          }
        }
      );

      const reposJson = await reposRes.json();
      const repos = reposJson.map((r: any) => r.full_name);

      const encoded = btoa(JSON.stringify(repos));

      return Response.redirect(
        `https://gitquick-web.pages.dev/?repos=${encoded}`,
        302
      );
    }

    /* =========================
       SUBIDA ZIP (FUTURO)
    ========================= */
    if (req.method === "POST") {
      return new Response("ZIP endpoint listo ✔");
    }

    return new Response("GitQuick Worker OK");
  }
};
