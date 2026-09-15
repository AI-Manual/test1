export default {

  async fetch(request, env) {


    const corsHeaders = {

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"

    };


    // CORS
    if(request.method === "OPTIONS"){

      return new Response(null,{
        status:204,
        headers:corsHeaders
      });

    }



    // GET確認
    if(request.method === "GET"){

      return new Response(

        JSON.stringify({

          success:true,

          message:"AI Manual Worker OK"

        }),

        {
          headers:{
            ...corsHeaders,
            "content-type":"application/json"
          }
        }

      );

    }



    // POST以外拒否
    if(request.method !== "POST"){

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



    // APIキー確認
    const apiKey = env.GEMINI_API_KEY;


    if(!apiKey){

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



    // =========================
    // 動画取得
    // =========================

    const formData =
      await request.formData();


    const video =
      formData.get("video");



    if(!video){

      return new Response(

        JSON.stringify({

          success:false,

          message:"video missing"

        }),

        {
          status:400,

          headers:{
            ...corsHeaders,
            "content-type":"application/json"
          }
        }

      );

    }



    // =========================
    // 動画受信確認
    // =========================

    return new Response(

      JSON.stringify({

        success:true,

        message:"video received",

        filename:
          video.name,

        type:
          video.type,

        size:
          video.size

      },null,2),

      {

        headers:{

          ...corsHeaders,

          "content-type":
            "application/json"

        }

      }

    );


  }

};
