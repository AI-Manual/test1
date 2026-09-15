export default {

  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };


    if (request.method === "OPTIONS") {

      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });

    }


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


    if (request.method !== "POST") {

      return new Response(
        JSON.stringify({
          success:false,
          message:"Method Not Allowed"
        }),
        {
          status:405,
          headers:{
            ...corsHeaders,
            "content-type":"application/json"
          }
        }
      );

    }


    const apiKey = env.GEMINI_API_KEY;


    if (!apiKey) {

      return new Response(
        JSON.stringify({
          success:false,
          message:"GEMINI_API_KEY missing"
        }),
        {
          status:500,
          headers:{
            ...corsHeaders,
            "content-type":"application/json"
          }
        }
      );

    }


    const response = await fetch(

      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
      + apiKey,

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
                  text:"AI作業マニュアル解析開始。作業内容を説明してください。"
                }

              ]
            }

          ]

        })

      }

    );


    const data = await response.json();


    return new Response(

      JSON.stringify(
        {
          success:true,
          data:data
        },
        null,
        2
      ),

      {
        headers:{
          ...corsHeaders,
          "content-type":"application/json"
        }
      }

    );


  }

};
