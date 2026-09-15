export default {

  async fetch(request, env) {


    const corsHeaders = {

      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"

    };


    // =========================
    // CORS
    // =========================

    if(request.method === "OPTIONS"){

      return new Response(null,{
        status:204,
        headers:corsHeaders
      });

    }



    // =========================
    // GET確認
    // =========================

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



    // =========================
    // POSTのみ
    // =========================

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
    // Gemini 動画解析
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

必ずJSONのみを返してください。
Markdown記法（```json）は使用しないでください。

以下の形式で出力してください。

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

抽出内容：

・作業名称
・作業概要
・作業手順
・使用工具
・危険ポイント
・注意事項

動画内で確認できない内容は推測せず空欄にしてください。
`

                  }

                ]

              }

            ]

          })

        }

      );



    // =========================
    // Gemini結果取得
    // =========================

    const result =
      await geminiResponse.json();



    const text =
      result.candidates?.[0]
      ?.content
      ?.parts?.[0]
      ?.text || "";



    let manual;


    try{


      manual =
        JSON.parse(

          text
          .replace(/```json/g,"")
          .replace(/```/g,"")
          .trim()

        );


    }catch(e){


      return new Response(

        JSON.stringify({

          success:false,

          message:"Gemini JSON parse failed",

          raw:text

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



    // =========================
    // GAS保存
    // =========================

    const gasUrl =
      env.GAS_API_URL;



    if(gasUrl){


      const saveData = {


        jobId:
          manual.jobId || "",


        videoId:
          manual.videoId || "",


        title:
          manual.title || "",


        summary:
          manual.summary || "",


        steps:
          manual.steps || [],


        tools:
          manual.tools || [],


        parts:
          manual.parts || [],


        danger:
          manual.danger || [],


        notes:
          manual.notes || "",


        checklist:
          manual.checklist || [],


        rawJson:
          manual

      };



      const gasResponse =
        await fetch(

          gasUrl,

          {

            method:"POST",

            headers:{

              "Content-Type":
                "application/json"

            },

            body:

              JSON.stringify(
                saveData
              )

          }

        );



      const gasResult =
        await gasResponse.json();



      manual.gasSave =
        gasResult;


    }



    // =========================
    // 結果返却
    // =========================

    return new Response(

      JSON.stringify({

        success:true,

        data:manual

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

