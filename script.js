const track=document.getElementById('track'), scoreEl=document.getElementById('score'), levelEl=document.getElementById('level');
const gameOverScreen=document.getElementById('gameOver'), pauseMenu=document.getElementById('pauseMenu'), startScreen=document.getElementById('startScreen');
let lane=1,score=0,level=1,baseSpeed=1,isOver=false,isPaused=true,isJumping=false,isStarted=false;
let high=localStorage.getItem('naveedBest')||0;
document.getElementById('bestInfo').innerText=high;
const lanes=[28, 49.5, 71]; // % left position
const player=document.createElement('div'); player.id='player'; player.innerText='🏃'; track.appendChild(player);
function updatePlayerPos(){player.style.left=(lanes[lane]-10)+'%';}
updatePlayerPos();

function move(d){
  if(isOver||isPaused||!isStarted) return;
  if(d==='left'&&lane>0) lane--;
  if(d==='right'&&lane<2) lane++;
  if(d==='up'&&!isJumping){
    isJumping=true; player.classList.add('jump');
    setTimeout(()=>{player.classList.remove('jump');isJumping=false;},500);
    return;
  }
  updatePlayerPos();
}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft') move('left');
  if(e.key==='ArrowRight') move('right');
  if(e.key==='ArrowUp'||e.code==='Space') move('up');
});
let sx=0;
track.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;},{passive:false});
track.addEventListener('touchend',e=>{
  let ex=e.changedTouches[0].clientX;
  let diff=ex-sx;
  if(diff>40) move('right');
  else if(diff<-40) move('left');
  else move('up');
},{passive:false});

// Speed Control
const speedControl=document.getElementById('speedControl');
const speedValue=document.getElementById('speedValue');
speedControl.addEventListener('input',()=>{
  baseSpeed=parseFloat(speedControl.value);
  speedValue.innerText=baseSpeed+'x';
});

function spawnObs(){
  if(isOver||isPaused||!isStarted) return;
  let l=Math.floor(Math.random()*3);
  let el=document.createElement('div');
  el.className='obstacle '+(Math.random()>0.5?'train':'barrier');
  el.innerText=Math.random()>0.5?'🚆':'🚧';
  el.style.left=(lanes[l]-10)+'%';
  el.style.top='30%';
  el.dataset.lane=l;
  track.appendChild(el);
  let y=30;
  let iv=setInterval(()=>{
    if(isPaused){return;}
    if(isOver){clearInterval(iv);el.remove();return;}
    y+=baseSpeed*0.8;
    el.style.top=y+'%';
    if(y>73&&y<84&&parseInt(el.dataset.lane)===lane&&!isJumping){endGame();}
    if(y>100){clearInterval(iv);el.remove();}
  },16);
}

function spawnCoin(){
  if(isOver||isPaused||!isStarted) return;
  let l=Math.floor(Math.random()*3);
  let c=document.createElement('div'); c.className='coin'; c.innerText='💰';
  c.style.left=(lanes[l]-5.5)+'%'; c.style.top='30%'; c.dataset.lane=l;
  track.appendChild(c);
  let y=30;
  let iv=setInterval(()=>{
    if(isPaused) return;
    if(isOver){clearInterval(iv);c.remove();return;}
    y+=baseSpeed*0.8;
    c.style.top=y+'%';
    if(y>72&&y<85&&parseInt(c.dataset.lane)===lane){score+=10;upd();c.remove();clearInterval(iv);}
    if(y>100){clearInterval(iv);c.remove();}
  },16);
}
function upd(){
  scoreEl.innerText='💰 '+score;
  level=Math.floor(score/150)+1;
  levelEl.innerText='Lvl '+level;
  document.getElementById('levelInfo').innerText=level;
}
function endGame(){
  isOver=true; isStarted=false;
  if(score>high){high=score;localStorage.setItem('naveedBest',high);}
  document.getElementById('finalScore').innerText='Score: '+score+' | BY NAVEED AZIZ';
  document.getElementById('highScore').innerText='Best: '+high;
  gameOverScreen.style.display='flex';
}
function shareGame(){
  const url='https://naveedaziz2312.github.io/Subway-surfers/';
  const txt=`🏃 Subway Surfers BY NAVEED AZIZ - Mera Score ${score}! Aap bhi khelo: ${url}`;
  if(navigator.share){navigator.share({title:'Naveed Game',text:txt,url});}
  else{navigator.clipboard.writeText(url); alert('Link Copy Ho Gaya! '+url);}
}
document.getElementById('playBtn').onclick=()=>{
  startScreen.style.display='none';
  isPaused=false; isStarted=true; isOver=false;
  score=0; lane=1; updatePlayerPos(); upd();
};
document.getElementById('restartBtn').onclick=()=>location.reload();
document.getElementById('restartBtn2').onclick=()=>location.reload();
document.getElementById('pauseBtn').onclick=()=>{if(!isStarted)return; isPaused=true; pauseMenu.style.display='flex';};
document.getElementById('resumeBtn').onclick=()=>{isPaused=false; pauseMenu.style.display='none';};
document.getElementById('shareBtn').onclick=shareGame;
document.getElementById('shareBtn2').onclick=shareGame;

setInterval(spawnObs,1300);
setInterval(spawnCoin,1500);
setInterval(()=>{if(!isOver&&!isPaused&&isStarted){score+=1; upd();}},300);
