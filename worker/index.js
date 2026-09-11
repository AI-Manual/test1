export default {

async fetch(request, env) {


const corsHeaders = {

"Access-Control-Allow-Origin":"*",

"Access-Control-Allow-Methods":
"GET, POST, OPTIONS",

"Access-Control-Allow-Headers":
"Content-Type"

};


// CORS preflight
if(request.method === "OPTIONS"){

return new Response(null,{
headers:corsHeaders
});

}



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



if(request.method !== "POST"){

return new Response(
"Method Not Allowed",
{
status:405,
headers:corsHeaders
}
);

}



const apiKey = env.GEMINI_API_KEY;

  console.log(
  apiKey ? "KEY_EXISTS" : "KEY_MISSING"
);
console.log(
  apiKey ? apiKey.length : 0
);


const response = await fetch(
"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key="
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
text:"AI作業マニュアル解析開始"
}
]
}
]

})

}

);



const data = await response.json();



return new Response(

JSON.stringify(data,null,2),

{

headers:{

...corsHeaders,

"content-type":"application/json"

}

}

);


}

};
