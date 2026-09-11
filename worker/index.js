export default {

  async fetch(request, env) {

    // GET確認
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "AI Manual Worker OK"
        }),
        {
          headers: {
            "content-type": "application/json"
          }
        }
      );
    }


    // POST以外拒否
    if (request.method !== "POST") {
      return new Response(
        "Method Not Allowed",
        {
          status: 405
        }
      );
    }


    const apiKey = env.GEMINI_API_KEY;


    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success:false,
          error:"GEMINI_API_KEY missing"
        }),
        {
          headers:{
            "content-type":"application/json"
          }
        }
      );
    }


    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({

          contents:[
            {
              parts:[
                {
                  text:
`あなたは製造現場の作業分析AIです。

以下の役割をしてください。

・作業内容を分析
・作業手順を整理
・危険ポイントを抽出

今回は接続テストです。
「AI作業マニュアル解析開始」と返答してください。`
                }
              ]
            }
          ]

        })
      }
    );


    const data = await response.json();


    return new Response(
      JSON.stringify(data,null,2),
      {
        headers:{
          "content-type":"application/json"
        }
      }
    );

  }

};
