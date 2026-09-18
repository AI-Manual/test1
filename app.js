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

    manual.aiResultId =
  response.data.gasSave?.aiResultId || "";

    manual.createdAt =
  new Date().toISOString();


    let output =
      "";


    // =====================
    // タイトル
    // =====================

    output +=
`
<h2>タイトル</h2>

<input
  id="manualTitle"
  type="text"
  value="${manual.title || ""}"
  style="
    width:100%;
    font-size:20px;
    padding:8px;
    box-sizing:border-box;
  ">
`;


    // =====================
    // 概要
    // =====================

    output +=
`
<h2>概要</h2>

<textarea
  id="manualSummary"
  style="
    width:100%;
    height:120px;
    padding:8px;
    box-sizing:border-box;
  "
>${manual.summary || ""}</textarea>
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
<div
  style="
    border:1px solid #ccc;
    padding:15px;
    margin-bottom:25px;
    border-radius:8px;
  ">

<h3>手順 ${step.stepNo}</h3>

<input
  type="text"
  id="stepTitle${step.stepNo}"
  value="${step.title || ""}"
  style="
    width:100%;
    font-size:18px;
    padding:8px;
    box-sizing:border-box;
    margin-bottom:10px;
  ">
`;


        // =====================
        // snapshot画像
        // =====================

        if(step.imageId){

          output +=
`
<div
  style="
    margin:10px 0;
  ">

<img
  src="${step.imageId}"
  style="
    max-width:500px;
    width:100%;
    border:1px solid #ccc;
    border-radius:4px;
  ">

</div>
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
<textarea
  id="stepDescription${step.stepNo}"
  style="
    width:100%;
    height:120px;
    padding:8px;
    box-sizing:border-box;
  "
>${step.description || ""}</textarea>
`;


        output +=
`
<table
  style="
    width:100%;
    margin-top:10px;
    border-collapse:collapse;
  ">

<tr>

<th
  style="
    width:120px;
    text-align:left;
  ">
開始
</th>

<td>
${step.startTime || ""}
</td>

</tr>

<tr>

<th
  style="
    text-align:left;
  ">
終了
</th>

<td>
${step.endTime || ""}
</td>

</tr>

<tr>

<th
  style="
    text-align:left;
  ">
部品
</th>

<td>
${step.part || ""}
</td>

</tr>

<tr>

<th
  style="
    text-align:left;
  ">
工具
</th>

<td>
${step.tool || ""}
</td>

</tr>

<tr>

<th
  style="
    text-align:left;
  ">
危険
</th>

<td>
${step.danger || ""}
</td>

</tr>

<tr>

<th
  style="
    text-align:left;
  ">
補足
</th>

<td>
${step.note || ""}
</td>

</tr>

</table>

</div>
`;

      });

    }
        // =====================
    // 使用工具
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
    // 部品・材料
    // =====================

    output +=
`
<h2>部品・材料</h2>
`;


    if(
      Array.isArray(manual.parts)
    ){

      if(manual.parts.length){

        manual.parts.forEach(part=>{

          output +=
`
<p>・${part}</p>
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


    // =====================
    // 補足事項
    // =====================

    output +=
`
<h2>補足事項</h2>

<textarea
  id="manualNotes"
  style="
    width:100%;
    height:120px;
    padding:8px;
    box-sizing:border-box;
  "
>${manual.notes || ""}</textarea>
`;


    // =====================
    // チェックリスト
    // =====================

    output +=
`
<h2>チェックリスト</h2>
`;

    if(
      Array.isArray(manual.checklist)
    ){

      if(manual.checklist.length){

        manual.checklist.forEach(item=>{

          output +=
`
<p>☐ ${item}</p>
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
    // 保存ボタン（まだ動作なし）
    // =====================

    output +=
`
<div
  style="
    margin-top:30px;
    text-align:center;
  ">

<button
  id="saveManualBtn"
  type="button"
  disabled
  style="
    padding:10px 30px;
    font-size:16px;
    cursor:not-allowed;
  ">
保存（次回実装）
</button>

</div>
`;


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
