export default {

async fetch(request,env){

 return new Response(
 JSON.stringify({
  success:true,
  message:"AI Manual Worker OK"
 }),
 {
  headers:{
   "content-type":"application/json"
  }
 }
 );

}

}
