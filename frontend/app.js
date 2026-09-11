const API_URL = "";


document
.getElementById("analyzeBtn")
.addEventListener("click", async ()=>{


 const file =
 document.getElementById("videoFile").files[0];


 if(!file){

  alert("動画を選択してください");

  return;

 }


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


 const data =
 await res.json();


 document
 .getElementById("result")
 .textContent =
 JSON.stringify(
 data,
 null,
 2
 );


});
