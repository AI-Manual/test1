export default {

  async fetch(request, env) {

    const corsHeaders = {

      "Access-Control-Allow-Origin":"*",

      "Access-Control-Allow-Methods":
        "GET, POST, OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"

    };


    // =========================
    // CORS
    // =========================

    if(request.method==="OPTIONS"){

      return new Response(null,{
        status:204,
        headers:corsHeaders
      });

    }


    // =========================
    // GET
    // =========================

    if(request.method==="GET"){

      return new Response(

        JSON.stringify({

          success:true,

          message:"AI Manual Worker OK"

        }),

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
    // POSTのみ
    // =========================

    if(request.method!=="POST"){

      return new Response(

        JSON.stringify({

          success:false,

          message:"Method Not Allowed"

        }),

        {

          status:405,

          headers:{

            ...corsHeaders,

            "content-type":
              "application/json"

          }

        }

      );

    }


    // =========================
    // API KEY
    // =========================

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

            "content-type":
              "application/json"

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

            "content-type":
              "application/json"

          }

        }

      );

    }


    // =========================
    // Gemini Files Upload
    // =========================

    const uploadResponse =
      await fetch(

        "https://generativelanguage.googleapis.com/upload/v1beta/files?key="
        + apiKey,

        {

          method:"POST",

          headers:{

            "X-Goog-Upload-Protocol":"raw",

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

            "content-type":
              "application/json"

          }

        }

      );

    }


    const fileUri =
      uploadData.file.uri;
        // =========================
    // Gemini 動画解析
    // =========================

    const prompt = `
あなたは作業マニュアル作成AIです。

この動画を解析してください。

回答は必ずJSONのみを返してください。
説明文は禁止です。
Markdownは禁止です。
\`\`\`json も出力しないでください。

必ず次の形式で返してください。

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
  "parts":[],
  "danger":[],
  "notes":"",
  "checklist":[]
}

条件

・動画で確認できる内容だけを書く
・推測は禁止
・確認できない項目は空欄
・stepsは作業順にする
・toolsは使用工具
・partsは部品・材料
・dangerは危険ポイント
・notesは補足事項
・checklistは作業確認項目
`;

    const geminiResponse =
      await fetch(

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

                    fileData:{

                      mimeType:video.type,

                      fileUri:fileUri

                    }

                  },

                  {

                    text:prompt

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
            .replace(/```json/gi,"")
            .replace(/```/g,"")
            .trim()

        );

    }catch(e){

      return new Response(

        JSON.stringify({

          success:false,

          message:"Gemini JSON parse failed",

          raw:text,

          gemini:result

        },null,2),

        {

          status:500,

          headers:{

            ...corsHeaders,

            "content-type":
              "application/json"

          }

        }

      );

    }


    // =========================
    // GAS保存データ作成
    // =========================

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

      // =========================
    // GAS保存
    // =========================

    const gasUrl =
      env.GAS_API_URL;


    if(gasUrl){

      try{

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
                JSON.stringify(saveData)

            }

          );


        const gasResult =
          await gasResponse.json();


        manual.gasSave =
          gasResult;

      }catch(e){

        manual.gasSave = {

          success:false,

          message:
            e.message

        };

      }

    }else{

      manual.gasSave = {

        success:false,

        message:
          "GAS_API_URL not set"

      };

    }

      // =========================
    // 結果返却
    // =========================

    return new Response(

      JSON.stringify(

        {

          success:true,

          data:manual

        },

        null,

        2

      ),

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
