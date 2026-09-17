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
<h3>${step.stepNo}. ${step.title || ""}</h3>

<p>
${step.description || ""}
</p>
`;



        // =====================
        // snapshot画像
        // =====================

        if(step.imageId){


          output +=
`
<img 
src="${step.imageId}" 
width="400"
>

<br>
`;

        }



        if(step.snapshotTime){


          output +=
`
<p>
snapshot:
${step.snapshotTime}
</p>
`;

        }



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


      manual.tools.forEach(tool=>{


        output +=
`
<p>・${tool}</p>
`;


      });


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


      manual.danger.forEach(danger=>{


        output +=
`
<p>・${danger}</p>
`;


      });


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
