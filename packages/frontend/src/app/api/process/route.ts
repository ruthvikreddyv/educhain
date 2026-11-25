import {NextRequest, NextResponse} from "next/server";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 try{
  const body=await request.formData();
  const file=body.get("file");
  if(!(file instanceof File)||file.size>4*1024*1024)return NextResponse.json({detail:"Choose a PDF of at most 4 MB."},{status:400});
  const base=process.env.EDUCHAIN_BACKEND_URL||"https://educhain-backend-reddyruthvik679-8957s-projects.vercel.app";
  const response=await fetch(base+"/upload",{method:"POST",body,cache:"no-store",signal:AbortSignal.timeout(20000)});
  const result=await response.json();
  return NextResponse.json(result,{status:response.status,headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({detail:"Document processing unavailable."},{status:503});}
}
