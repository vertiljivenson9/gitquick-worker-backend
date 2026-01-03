export default {
  async fetch(req: Request, env: any) {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (!body.repo) {
      return new Response("Missing repo", { status: 400 });
    }

    const response = await fetch(
      `https://api.github.com/repos/${body.repo}/dispatches`,
      {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({
          event_type: "gitquick_push"
        })
      }
    );

    if (!response.ok) {
      return new Response(await response.text(), { status: 500 });
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
