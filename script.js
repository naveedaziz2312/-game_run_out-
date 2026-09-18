// REAL SUBWAY BALI - By Naveed Aziz - Offline PWA
const canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),coinsEl=document.getElementById('coins');
const overlay=document.getElementById('overlay'),fill=document.getElementById('fill'),loadText=document.getElementById('loadText'),playBtn=document.getElementById('playBtn');
let W,H;function resize(){W=canvas.width=canvas.parentElement.clientWidth*2;H=canvas.height=canvas.parentElement.clientHeight*2;canvas.style.width=W/2+'px';canvas.style.height=H/2+'px'}resize();window.addEventListener('resize',resize);

let loading=0;let loader=setInterval(()=>{loading+=2;fill.style.width=loading+'%';loadText.innerText='Loading '+loading+'%';if(loading>=100){clearInterval(loader);playBtn.style.display='block';loadText.innerText='Ready!'}},30);

let lane=1,playerY=0,playerVY=0,jumping=false,rolling=false,rollTime=0,score=0,coins=0,speed=8,gameOver=false,playing=false;
let obstacles=[],coinObjs=[],particles=[];
let lastSpawn=0;

const lanes=[-120,0,120]; // 3 lanes x offset

playBtn.onclick=startGame;
function startGame(){overlay.style.display='none';playing=true;gameOver=false;score=0;coins=0;obstacles=[];coinObjs=[];lane=1;requestAnimationFrame(loop)}

function spawn(){
 if(Date.now()-lastSpawn<600)return;lastSpawn=Date.now();
 let type=Math.random();
 if(type<0.6){ // train
   let l=Math.floor(Math.random()*3);
   obstacles.push({lane:l,y:-600,h:120,type:'train',w:140,color:Math.random()>0.5?'#e74c3c':'#3498db'})
 }else if(type<0.8){ // barrier
   let l=Math.floor(Math.random()*3);
   obstacles.push({lane:l,y:-600,h:40,type:'barrier',w:130,color:'#fff'})
 }else{ // coin line
   let l=Math.floor(Math.random()*3);
   for(let i=0;i<3;i++) coinObjs.push({lane:l,y:-600-i*50})
 }
 // extra coins
 if(Math.random()<0.7){
   let l=Math.floor(Math.random()*3);
   coinObjs.push({lane:l,y:-600})
 }
}

function loop(){
 if(!playing)return;
 ctx.clearRect(0,0,W,H);
 // Background - Bali
 ctx.fillStyle='#87CEEB';ctx.fillRect(0,0,W,H*0.45);
 ctx.fillStyle='#f6d365';ctx.fillRect(0,H*0.45,W,H*0.55); // sand
 // tracks perspective
 ctx.strokeStyle='#555';ctx.lineWidth=4;
 for(let i=-1;i<=1;i++){
   let x=W/2+i*180;
   ctx.beginPath();ctx.moveTo(x-80,H);ctx.lineTo(W/2+i*20,H*0.4);ctx.stroke();
 }
 // update physics
 if(jumping){playerY+=playerVY;playerVY-=1.5;if(playerY<=0){playerY=0;jumping=false;playerVY=0}}
 if(rolling){rollTime--;if(rollTime<=0)rolling=false}

 // spawn
 spawn();
 speed+=0.005;
 score+=1;scoreEl.innerText=Math.floor(score/10);

 // obstacles
 for(let i=obstacles.length-1;i>=0;i--){
   let o=obstacles[i];o.y+=speed;
   let ox=W/2+lanes[o.lane]* (0.5+o.y/H);
   let oy=H*0.5+o.y*0.6;
   let scale=0.3+ (oy/H)*0.8;
   if(o.type==='train'){
     ctx.fillStyle=o.color;ctx.fillRect(ox-o.w*scale/2,oy,o.w*scale,o.h*scale);
     ctx.fillStyle='#222';ctx.fillRect(ox-o.w*scale/2,oy+10*scale,o.w*scale,8*scale);
   }else{
     ctx.fillStyle='#fff';ctx.fillRect(ox-o.w*scale/2,oy,o.w*scale,20*scale);
     ctx.fillStyle='#e74c3c';ctx.fillRect(ox-o.w*scale/2,oy,20*scale,20*scale);
     ctx.fillRect(ox+o.w*scale/2-20*scale,oy,20*scale,20*scale);
   }
   // collision
   if(o.lane===lane && oy>H*0.65 && oy<H*0.85 &&!jumping &&!rolling){
     if(!(o.type==='barrier' && rolling)) return endGame();
   }
   if(o.type==='barrier' && o.lane===lane && oy>H*0.65 && oy<H*0.85 &&!jumping &&!rolling) return endGame();
   if(o.y>400){obstacles.splice(i,1)}
 }
 // coins
 for(let i=coinObjs.length-1;i>=0;i--){
   let c=coinObjs[i];c.y+=speed;
   let cx=W/2+lanes[c.lane]* (0.5+c.y/H);
   let cy=H*0.5+c.y*0.6;
   let scale=0.3+ (cy/H)*0.8;
   ctx.fillStyle='#ffcc00';ctx.strokeStyle='#ff6a00';ctx.lineWidth=3*scale;
   ctx.beginPath();ctx.arc(cx,cy,14*scale,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.fillStyle='#ff6a00';ctx.font=`${12*scale}px Arial`;ctx.fillText('$',cx-4*scale,cy+4*scale);
   if(c.lane===lane && cy>H*0.68 && cy<H*0.9){coins++;coinsEl.innerText=coins;coinObjs.splice(i,1);continue}
   if(c.y>400)coinObjs.splice(i,1)
 }
 // player
 let px=W/2+lanes[lane]*0.9;
 let py=H*0.78+playerY;
 ctx.fillStyle=rolling?'#ffeb3b':'#00a8ff';
 ctx.fillRect(px-25,py-(rolling?20:50),50,rolling?20:50);
 ctx.fillStyle='#fff';ctx.fillRect(px-15,py-45,30,15); // cap
 if(gameOver)return;
 requestAnimationFrame(loop);
}

function endGame(){playing=false;overlay.style.display='flex';playBtn.innerText='PLAY AGAIN';loadText.innerText='Game Over! Score: '+Math.floor(score/10);fill.style.width='100%';playBtn.style.display='block'}

 // controls
 let sx=0;canvas.addEventListener('touchstart',e=>sx=e.touches[0].clientX);
 canvas.addEventListener('touchend',e=>{
   let dx=e.changedTouches[0].clientX-sx;
   let dy=e.changedTouches[0].clientY-(e.touches?0:0);
   if(Math.abs(dx)>40){if(dx>0 && lane<2)lane++;else if(dx<0 && lane>0)lane--;}
   else { // tap
     if(!jumping){jumping=true;playerVY=22}
   }
 });
 canvas.addEventListener('touchmove',e=>{if(e.touches[0].clientY-sx>50){rolling=true;rollTime=30}});
 document.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft' && lane>0)lane--;
   if(e.key==='ArrowRight' && lane<2)lane++;
   if(e.key===' ' &&!jumping){jumping=true;playerVY=22}
   if(e.key==='ArrowDown'){rolling=true;rollTime=30}
 });

 // swipe down
 let sy=0;canvas.addEventListener('touchstart',e=>sy=e.touches[0].clientY,{passive:true});
 canvas.addEventListener('touchend',e=>{
   if(e.changedTouches[0].clientY-sy>80){rolling=true;rollTime=40}
 },{passive:true});
