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



    // POSTのみ
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



    const apiKey =
      env.GEMINI_API_KEY;



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
    // Gemini Files API upload
    // =========================

    const uploadResponse =
      await fetch(

        "https://generativelanguage.googleapis.com/upload/v1beta/files?key="
        + apiKey,

        {

          method:"POST",

          headers:{

            "X-Goog-Upload-Protocol":
              "raw",

            "X-Goog-Upload-File-Name":
              video.name,

            "Content-Type":
              video.type

          },

          body:
            await video.arrayBuffer()

        }

      );



    const uploadData =
      await uploadResponse.json();



    if(!uploadData.file){

      return new Response(

        JSON.stringify({

          success:false,

          message:"Gemini upload failed",

          data:uploadData

        },null,2),

        {
          status:500,

          headers:{
            ...corsHeaders,
            "content-type":"application/json"
          }
        }

      );

    }



    const fileUri =
      uploadData.file.uri;



    // =========================
    // Gemini解析
    // =========================

    const geminiResponse =
      await fetch(

        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
        + apiKey,

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:JSON.stringify({

            contents:[

              {

                parts:[

                  {

                    fileData:{

                      mimeType:
                        video.type,

                      fileUri:
                        fileUri

                    }

                  },

                  {

                    text:
                      `
この動画を解析してください。

作業マニュアル作成用です。

以下の形式でJSON出力してください。

{
"title":"",
"summary":"",
"steps":[
 {
  "stepNo":1,
  "title":"",
  "description":""
 }
],
"tools":[],
"danger":[]
}

動画内の作業手順、使用工具、注意点を抽出してください。
`

                  }

                ]

              }

            ]

          })

        }

      );



    const result =
  await geminiResponse.json();


return new Response(

  JSON.stringify({

    success:true,

    data:result

  },null,2),

  {

    headers:{

      ...corsHeaders,

      "content-type":
        "application/json"

    }

  }

);
