const API_URL =
  "https://test1.valhiroyuki.workers.dev";


document
.getElementById("analyzeBtn")
.addEventListener("click", async ()=>{


  const file =
    document
    .getElementById("videoFile")
    .files[0];


  if(!file){

    alert("動画を選択してください");

    return;

  }


  const result =
    document.getElementById("result");


  result.textContent =
    "解析中...";


  try {


    const formData =
      new FormData();


    formData.append(
      "video",
      file
    );


    const res =
      await fetch(

        API_URL + "/api/analyze",

        {

          method:"POST",

          body:formData

        }

      );


    const response =
      await res.json();


    if(!response.success){

      result.textContent =
        response.message ||
        "解析に失敗しました";

      return;

    }


    const manual =
      response.data;


    let output =
      "";


    // =====================
    // タイトル
    // =====================

    output +=
`
<h2>タイトル</h2>
<p>${manual.title || ""}</p>
`;


    // =====================
    // 概要
    // =====================

    output +=
`
<h2>概要</h2>
<p>${manual.summary || ""}</p>
`;


    // =====================
    // 手順
    // =====================

    output +=
`
<h2>作業手順</h2>
`;


    if(
      Array.isArray(manual.steps)
    ){


      manual.steps.forEach(step=>{


        output +=
`
<div style="margin-bottom:40px;">

<h3>${step.stepNo}. ${step.title || ""}</h3>
`;


        // =====================
        // snapshot画像
        // =====================

        if(step.imageId){

          output +=
`
<img
  src="${step.imageId}"
  style="
    max-width:500px;
    width:100%;
    border:1px solid #ccc;
    margin:10px 0;
  ">
`;

        }


        if(step.snapshotTime){

          output +=
`
<p>
<b>Snapshot :</b>
${step.snapshotTime}
</p>
`;

        }


        output +=
`
<p>
${step.description || ""}
</p>

</div>
`;


      });


    }


    // =====================
    // 工具
    // =====================

    output +=
`
<h2>使用工具</h2>
`;


    if(
      Array.isArray(manual.tools)
    ){

      if(manual.tools.length){

        manual.tools.forEach(tool=>{

          output +=
`
<p>・${tool}</p>
`;

        });

      }else{

        output +=
`
<p>なし</p>
`;

      }

    }


    // =====================
    // 注意事項
    // =====================

    output +=
`
<h2>注意事項</h2>
`;


    if(
      Array.isArray(manual.danger)
    ){

      if(manual.danger.length){

        manual.danger.forEach(danger=>{

          output +=
`
<p>・${danger}</p>
`;

        });

      }else{

        output +=
`
<p>なし</p>
`;

      }

    }


    result.innerHTML =
      output;


  } catch(error){


    result.textContent =
      JSON.stringify(

        {

          success:false,

          message:error.message

        },

        null,

        2

      );


  }


});
