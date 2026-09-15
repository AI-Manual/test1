export default {

  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // GET
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "AI Manual Worker OK"
        }),
        {
          headers: {
            ...corsHeaders,
            "content-type": "application/json"
          }
        }
      );
    }

    // POST以外
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Method Not Allowed"
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "content-type": "application/json"
          }
        }
      );
    }

    // APIキー確認
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "GEMINI_API_KEY missing"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "content-type": "application/json"
          }
        }
      );
    }

    // 利用可能モデル一覧取得
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey
    );

    const data = await response.json();

    return new Response(
      JSON.stringify(data, null, 2),
      {
        headers: {
          ...corsHeaders,
          "content-type": "application/json"
        }
      }
    );

  }

};
