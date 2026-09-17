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
    // Cloudinary Upload
    // =========================

    const cloudinaryForm =
      new FormData();



    cloudinaryForm.append(
      "file",
      video
    );



    cloudinaryForm.append(

      "upload_preset",

      env.CLOUDINARY_UPLOAD_PRESET

    );



    cloudinaryForm.append(

      "folder",

      "videos"

    );



    const cloudinaryResponse =
      await fetch(

        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/video/upload`,

        {

          method:"POST",

          body:cloudinaryForm

        }

      );



    const cloudinary =
      await cloudinaryResponse.json();

console.log("Cloudinary response", cloudinary);

    if(!cloudinary.public_id){


      return new Response(

        JSON.stringify({

          success:false,

          message:"Cloudinary upload failed",

　　　　　　 cloudinaryResponseStatus:
        cloudinaryResponse.status,
          
          cloudinary

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
      "description":"",
      "startTime":"",
      "endTime":"",
      "snapshotTime":"",
      "imageId":"",
      "tool":"",
      "part":"",
      "danger":"",
      "note":""
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

・各stepには
  startTime
  endTime
  snapshotTime
  を mm:ss 形式で付ける

・snapshotTimeは、その手順を代表する場面の時刻

・imageIdは空欄

・toolはその手順で使用した工具

・partはその手順で扱う部品・材料

・dangerはその手順の危険ポイント

・noteはその手順の補足事項


・toolsは動画全体で使用する工具一覧

・partsは動画全体で使用する部品・材料一覧

・dangerは動画全体の危険ポイント一覧

・notesは動画全体の補足事項

・checklistは最終確認項目

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



    if(result.error){

      return new Response(

        JSON.stringify({

          success:false,

          message:"Gemini API error",

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
    // snapshot imageId生成
    // =========================

    if(

      Array.isArray(manual.steps)

    ){


      manual.steps.forEach(step=>{


        if(!step.snapshotTime){

          return;

        }



        const time =
          step.snapshotTime.split(":");



        if(time.length !== 2){

          return;

        }



        const seconds =
          Number(time[0]) * 60 +
          Number(time[1]);



        step.imageId =

          `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/so_${seconds}/${cloudinary.public_id}.jpg`;


      });


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
