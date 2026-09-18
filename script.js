// REAL ROAD + REAL TRAIN - By Naveed Aziz
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),coinsEl=document.getElementById('coins');
const overlay=document.getElementById('overlay'),fill=document.getElementById('fill'),loadText=document.getElementById('loadText'),playBtn=document.getElementById('playBtn');
let W,H;function resize(){W=canvas.width=canvas.parentElement.clientWidth*2;H=canvas.height=canvas.parentElement.clientHeight*2;canvas.style.width=W/2+'px';canvas.style.height=H/2+'px'}resize();window.addEventListener('resize',resize);
let loading=0;let loader=setInterval(()=>{loading+=2;fill.style.width=loading+'%';loadText.innerText='Loading '+loading+'%';if(loading>=100){clearInterval(loader);playBtn.style.display='block';loadText.innerText='Ready - REAL BALI!'}},30);

const trainImg=new Image();trainImg.src='train.png';let trainLoaded=false;trainImg.onload=()=>trainLoaded=true;

let lane=1,playerY=0,playerVY=0,jumping=false,rolling=false,rollTime=0,score=0,coins=0,speed=9,playing=false;
let obstacles=[],coinObjs=[],lastSpawn=0,roadOffset=0,policeLane=1;

playBtn.onclick=startGame;
function startGame(){overlay.style.display='none';playing=true;score=0;coins=0;obstacles=[];coinObjs=[];lane=1;roadOffset=0;requestAnimationFrame(loop)}

function spawn(){
 if(Date.now()-lastSpawn<550)return;lastSpawn=Date.now();
 let l=Math.floor(Math.random()*3);
 // REAL TRAIN ahead
 if(Math.random()<0.7){
   obstacles.push({lane:l,y:-800,type:'train',h:110,w:150})
 }else{
   obstacles.push({lane:l,y:-800,type:'barrier',h:35,w:130})
 }
 // coins
 for(let k=0;k<2;k++){
   if(Math.random()<0.6)coinObjs.push({lane:Math.floor(Math.random()*3),y:-800-Math.random()*200})
 }
}

function loop(){
 if(!playing)return;
 ctx.clearRect(0,0,W,H);
 // SKY
 ctx.fillStyle='#7ec8e3';ctx.fillRect(0,0,W,H*0.42);
 // BALI TREES
 ctx.fillStyle='#2e7d32';for(let i=0;i<6;i++){let x=(i*W/6)+(Math.sin(roadOffset/50+i)*20);ctx.fillRect(x,H*0.25,14,H*0.18);ctx.beginPath();ctx.arc(x+7,H*0.25,28,0,Math.PI*2);ctx.fill();}

 roadOffset+=speed;

 // REAL ROAD with ZYADA RODS (Sleepers)
 ctx.fillStyle='#8d6e63';ctx.fillRect(0,H*0.42,W,H*0.58);
 // 3 tracks
 for(let track=-1;track<=1;track++){
   let cx=W/2+track*180;
   // rails
   ctx.strokeStyle='#4a4a4a';ctx.lineWidth=8;
   ctx.beginPath();ctx.moveTo(cx-70,H);ctx.lineTo(W/2+track*30,H*0.4);ctx.stroke();
   ctx.beginPath();ctx.moveTo(cx+70,H);ctx.lineTo(W/2+track*30+30,H*0.4);ctx.stroke();
   // ZYADA RODS - har 40px pe
   ctx.fillStyle='#3e2723';
   for(let r=0;r<30;r++){
     let y=H*0.4 + ((r*45 + roadOffset%45) % (H*0.6));
     let scale=0.3 + (y/H)*0.8;
     let x1=W/2+track*180*scale - 80*scale;
     let x2=W/2+track*180*scale + 80*scale;
     let width=(x2-x1);
     ctx.fillRect(x1,y,width,10*scale);
   }
 }

 spawn();speed+=0.004;score+=1;scoreEl.innerText=Math.floor(score/10);
 if(Math.floor(score/100)%30==0)policeLane=lane;

 // Draw obstacles with REAL TRAIN
 for(let i=obstacles.length-1;i>=0;i--){
   let o=obstacles[i];o.y+=speed;
   let oy=H*0.5+o.y*0.6;
   let scale=0.25 + (oy/H)*0.85;
   let ox=W/2+o.lane*180*scale;
   if(o.type==='train' && trainLoaded){
     let tw=o.w*scale*1.8;let th=o.h*scale*1.2;
     ctx.drawImage(trainImg,ox-tw/2,oy-th/2,tw,th);
   }else if(o.type==='train'){
     ctx.fillStyle='#e74c3c';ctx.fillRect(ox-70*scale,oy,140*scale,80*scale);
   }else{
     ctx.fillStyle='#fff';ctx.fillRect(ox-60*scale,oy,120*scale,16*scale);
     ctx.fillStyle='#c0392b';ctx.fillRect(ox-60*scale,oy,16*scale,16*scale);ctx.fillRect(ox+44*scale,oy,16*scale,16*scale);
   }
   // collision - train real
   if(o.lane===lane && oy>H*0.62 && oy<H*0.88){
     if(o.type==='barrier' && rolling){} else if(!jumping){return endGame()}
   }
   if(o.y>500)obstacles.splice(i,1);
 }
 // Coins
 for(let i=coinObjs.length-1;i>=0;i--){
   let c=coinObjs[i];c.y+=speed;
   let cy=H*0.5+c.y*0.6;let scale=0.25+(cy/H)*0.8;
   let cx=W/2+c.lane*180*scale;
   ctx.fillStyle='#ffcc00';ctx.beginPath();ctx.arc(cx,cy,12*scale,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff6a00';ctx.lineWidth=2;ctx.stroke();
   if(c.lane===lane && cy>H*0.65 && cy<H*0.9){coins++;coinsEl.innerText=coins;coinObjs.splice(i,1);continue}
   if(c.y>500)coinObjs.splice(i,1);
 }
 // PLAYER REAL
 let px=W/2+lane*162;let py=H*0.78+playerY;
 ctx.font=`${rolling?28:46}px Arial`;ctx.textAlign='center';ctx.fillText(rolling?'🧎':'🏃‍♂️',px,py);
 // POLICE
 let polX=W/2+policeLane*158;let polY=H*0.92;
 ctx.font='42px Arial';ctx.fillText('👮',polX,polY);ctx.font='18px Arial';ctx.fillText('🐕',polX+28,polY);

 requestAnimationFrame(loop);
}
function endGame(){playing=false;overlay.style.display='flex';playBtn.innerText='PLAY AGAIN';loadText.innerText='Pakda Gaya! Score: '+Math.floor(score/10);playBtn.style.display='block'}
let sx=0,sy=0;canvas.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
canvas.addEventListener('touchend',e=>{
 let dx=e.changedTouches[0].clientX-sx;let dy=e.changedTouches[0].clientY-sy;
 if(Math.abs(dx)>35 && Math.abs(dx)>Math.abs(dy)){if(dx>0&&lane<2)lane++;else if(dx<0&&lane>0)lane--;}
 else if(dy<-35){if(!jumping){jumping=true;playerVY=20}} else if(dy>45){rolling=true;rollTime=32} else {if(!jumping){jumping=true;playerVY=20}}
},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&lane>0)lane--;if(e.key==='ArrowRight'&&lane<2)lane++;if(e.key===' '&&!jumping){jumping=true;playerVY=20}if(e.key==='ArrowDown'){rolling=true;rollTime=32}});
