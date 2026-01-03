export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    /* ========= CALLBACK OAUTH ========= */
    if (url.pathname === "/oauth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("No code", { status: 400 });

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: { "Accept": "application/json" },
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
        return new Response(JSON.stringify(tokenData), { status: 500 });
      }

      const reposRes = await fetch("https://api.github.com/user/repos", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "User-Agent": "gitquick"
        }
      });

      const repos = (await reposRes.json()).map((r: any) => r.full_name);

      const encoded = btoa(JSON.stringify(repos));
      return Response.redirect(
        `https://gitquick-web.pages.dev/?repos=${encoded}`,
        302
      );
    }

    return new Response("GitQuick Worker OK");
  }
};
