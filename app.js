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
タイトル：
${manual.title || ""}


`;



    // =====================
    // 概要
    // =====================

    output +=
`
概要：
${manual.summary || ""}


`;



    // =====================
    // 手順
    // =====================

    output +=
`
作業手順：

`;



    if(
      Array.isArray(manual.steps)
    ){


      manual.steps.forEach(step=>{


        output +=
`
${step.stepNo}.
${step.title}

${step.description}


`;


      });


    }



    // =====================
    // 工具
    // =====================

    output +=
`
使用工具：

`;



    if(
      Array.isArray(manual.tools)
    ){


      manual.tools.forEach(tool=>{


        output +=
`・${tool}
`;


      });


    }



    // =====================
    // 注意事項
    // =====================

    output +=
`

注意事項：

`;



    if(
      Array.isArray(manual.danger)
    ){


      manual.danger.forEach(danger=>{


        output +=
`・${danger}
`;


      });


    }



    result.textContent =
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
