export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    /* ===========================
       OAUTH CALLBACK
    ============================ */
    if (url.pathname === "/oauth/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code
          })
        }
      );

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return new Response("OAuth failed", { status: 500 });
      }

      const reposRes = await fetch(
        "https://api.github.com/user/repos?per_page=100",
        {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Accept": "application/vnd.github+json"
          }
        }
      );

      const repos = await reposRes.json();
      const names = repos.map((r: any) => r.full_name);

      return new Response(
        `<script>
          window.opener.postMessage(
            ${JSON.stringify(names)},
            "*"
          );
          window.close();
        </script>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    /* ===========================
       DEFAULT API (ZIP PUSH LUEGO)
    ============================ */
    return new Response("GitQuick Worker OK");
  }
};
