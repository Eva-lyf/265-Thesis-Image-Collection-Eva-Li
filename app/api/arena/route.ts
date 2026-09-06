export async function GET(){
 const images:unknown[]=[];
 try { for(let page=1;page<=100;page++){
  const response=await fetch(`https://api.are.na/v2/channels/parsons-studio-256/contents?per=100&page=${page}`,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)return Response.json({error:response.status===401||response.status===403?'This Are.na channel is private. Make it public, then try again.':'Are.na is unavailable. Please try again later.'},{status:response.status===401||response.status===403?403:502});
  const data=await response.json() as {contents?:{class:string;id:number;title?:string;image?:{original?:{url:string}}}[]};const blocks=data.contents;
  if(!Array.isArray(blocks))return Response.json({error:'Are.na returned an unexpected response.'},{status:502});
  for(const b of blocks)if(b.class==='Image'&&b.image?.original?.url)images.push({arena_id:b.id,title:b.title||`Image ${b.id}`,url:b.image.original.url,source_url:`https://www.are.na/block/${b.id}`});
  if(blocks.length<100)return Response.json({images});
 }return Response.json({error:'Channel is too large for a single import.'},{status:422});
 }catch{return Response.json({error:'Could not reach Are.na. Please try again later.'},{status:502});}
}
