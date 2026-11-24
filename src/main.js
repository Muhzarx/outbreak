import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const $ = id => document.getElementById(id);
const ui = {
  loading:$('loading'), start:$('startScreen'), end:$('endScreen'), startBtn:$('startBtn'), restart:$('restartBtn'),
  health:$('healthBar'), healthValue:$('healthValue'), ammo:$('ammoValue'), reserve:$('reserveValue'),
  parts:$('partsValue'), objective:$('objectiveText'), toast:$('toast'), hint:$('interactionHint'),
  flash:$('damageFlash'), endTitle:$('endTitle'), endText:$('endText'), endEyebrow:$('endEyebrow')
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x11191a);
scene.fog = new THREE.FogExp2(0x11191a, 0.027);
const camera = new THREE.PerspectiveCamera(63, innerWidth/innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
$('game').insertBefore(renderer.domElement, $('game').firstChild);

const clock = new THREE.Clock();
const world = new THREE.Group(); scene.add(world);
const colliders = [];
const zombies = [], pickups = [], bullets = [];
const mats = {
  ground:new THREE.MeshStandardMaterial({color:0x252d2b,roughness:1}),
  asphalt:new THREE.MeshStandardMaterial({color:0x171d1c,roughness:.95}),
  concrete:new THREE.MeshStandardMaterial({color:0x454a45,roughness:1}),
  dark:new THREE.MeshStandardMaterial({color:0x202725,roughness:.9}),
  rust:new THREE.MeshStandardMaterial({color:0x63352b,roughness:.9}),
  glass:new THREE.MeshStandardMaterial({color:0x182d30,metalness:.3,roughness:.2}),
  yellow:new THREE.MeshStandardMaterial({color:0x9b7c38,roughness:.8}),
  player:new THREE.MeshStandardMaterial({color:0x343f3c,roughness:.9}),
  skin:new THREE.MeshStandardMaterial({color:0x9b7865,roughness:.9}),
  zombie:new THREE.MeshStandardMaterial({color:0x687468,roughness:1}),
  zombieDark:new THREE.MeshStandardMaterial({color:0x313b35,roughness:1}),
  blood:new THREE.MeshStandardMaterial({color:0x4b1715,roughness:1}),
  white:new THREE.MeshStandardMaterial({color:0xc2c6b6,emissive:0x3a4036})
};
scene.add(new THREE.HemisphereLight(0x91a7a0,0x171817,1.15));
const moon = new THREE.DirectionalLight(0x9eafa9,1.55); moon.position.set(-18,28,12); moon.castShadow=true; moon.shadow.mapSize.set(2048,2048); moon.shadow.camera.left=-45;moon.shadow.camera.right=45;moon.shadow.camera.top=45;moon.shadow.camera.bottom=-45; scene.add(moon);
const ambient = new THREE.PointLight(0xb65a3b,12,28); ambient.position.set(4,5,-12);scene.add(ambient);

function box(parent, x,y,z, sx,sy,sz, mat, cast=true, receive=true){
  const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=receive;parent.add(m);return m;
}
function cylinder(parent,x,y,z,rt,rb,h,mat,segments=10){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;
}
function addBuilding(x,z,w,d,h,seed=0){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 box(g,0,h/2,0,w,h,d,mats.concrete);
 const roof=box(g,0,h+.08,0,w+.3,.22,d+.3,mats.dark);
 for(let y=2;y<h-1;y+=2.25){
  for(let xx=-w/2+1;xx<w/2-0.5;xx+=2.2){
   const win=box(g,xx,y,-d/2-.012,1.05,1.1,.035,mats.glass,false);
   if((Math.floor(xx*3+y+seed)%4)===0) box(g,xx,y,-d/2-.04,1.08,.08,.05,mats.rust,false);
  }
 }
 for(let i=0;i<3;i++) box(g,(i-1)*w*.24,1.1,d/2+.02,.65,2.1,.06,mats.dark,false);
 colliders.push({x,z,w,d});
}
function makeStreet(){
 box(world,0,-.18,0,100,.35,100,mats.ground,false);
 box(world,0,.005,0,13,.05,100,mats.asphalt,false);
 for(let z=-45;z<50;z+=8) box(world,0,.04,z,.13,.025,3.2,mats.yellow,false);
 for(let side of [-1,1]){
  box(world,side*9,.1,0,5,.25,100,mats.concrete,false);
  for(let z=-43;z<48;z+=17){
   const x=side*17;
   addBuilding(x,z,12,13,10+(Math.abs(z)%3)*2,z);
  }
  for(let z=-35;z<40;z+=18){
   const pole=cylinder(world,side*7,.0,z,.09,.12,5,mats.dark);
   pole.position.y=2.5;
   const lamp=new THREE.PointLight(0xffbd78,2.8,11);lamp.position.set(side*7,5,z);world.add(lamp);
   const bulb=new THREE.Mesh(new THREE.SphereGeometry(.14,8,8),new THREE.MeshBasicMaterial({color:0xffd29a}));bulb.position.set(side*7,4.85,z);world.add(bulb);
  }
 }
 // wrecked cars
 for(const [x,z,r] of [[-4,-13,.12],[4,9,-.22],[-3,27,.4],[3,-34,-.3]]){
  const car=new THREE.Group();car.position.set(x,0,z);car.rotation.y=r;world.add(car);
  box(car,0,.75,0,2.1,.8,4,mats.dark);box(car,0,1.35,-.2,1.8,.55,2.1,mats.glass);
  for(const wx of [-1,1])for(const wz of [-1.25,1.25]){const wh=cylinder(car,wx,.42,wz,.34,.34,.18,mats.asphalt,12);wh.rotation.z=Math.PI/2;}
 }
 // barricade and gate
 for(let i=-2;i<=2;i++)box(world,i*1.1,.65,-44,.8,1.3,.45,mats.rust);
 box(world,0,3,-48,9,.35,.4,mats.dark);
 box(world,-4.2,2,-48,.35,4,.4,mats.rust);box(world,4.2,2,-48,.35,4,.4,mats.rust);
}
makeStreet();

// Player rig
const player=new THREE.Group();player.position.set(0,0,35);world.add(player);
const body=new THREE.Group();player.add(body);
cylinder(body,0,1.05,0,.38,.32,1.05,mats.player,9);
const head=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),mats.skin);head.position.set(0,1.82,0);head.castShadow=true;body.add(head);
const pack=box(body,0,1.15,.32,.5,.65,.22,mats.rust);pack.rotation.x=-.08;
const armL=box(body,-.42,1.22,-.02,.18,.7,.2,mats.player);armL.rotation.z=-.22;
const armR=box(body,.42,1.22,-.02,.18,.7,.2,mats.player);armR.rotation.z=.22;
const legL=box(body,-.18,.42,0,.22,.75,.25,mats.dark);const legR=box(body,.18,.42,0,.22,.75,.25,mats.dark);
const gun=box(body,.38,1.25,-.55,.12,.13,.55,mats.dark);gun.rotation.x=-.05;
player.userData={speed:4.5};
const playerRadius=.55;

function makeZombie(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
 const torso=box(g,0,1.1,0,.72,1.05,.42,mats.zombie);torso.rotation.x=-.12;
 const head=new THREE.Mesh(new THREE.SphereGeometry(.29,12,10),mats.zombie);head.position.set(0,1.9,-.02);head.castShadow=true;g.add(head);
 const jaw=box(g,0,1.68,-.25,.25,.12,.1,mats.blood);
 const a1=box(g,-.48,1.18,-.18,.19,.78,.2,mats.zombieDark);a1.rotation.z=-.5;
 const a2=box(g,.48,1.25,-.18,.19,.8,.2,mats.zombieDark);a2.rotation.z=.5;
 const l1=box(g,-.2,.42,0,.23,.8,.25,mats.zombieDark);const l2=box(g,.2,.42,0,.23,.8,.25,mats.zombieDark);
 g.userData={hp:3,attack:0,phase:Math.random()*5,parts:[torso,head,a1,a2,l1,l2]};
 zombies.push(g);return g;
}
[[-5,19],[5,11],[-2,-4],[4,-20],[-4,-31],[7,-40],[1,2],[-7,30]].forEach(p=>makeZombie(...p));

function makePickup(x,z,type){
 const g=new THREE.Group();g.position.set(x,.65,z);world.add(g);
 const color=type==='part'?0x66c7bc:type==='ammo'?0xc5a45b:0xb94b42;
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(.55,.55,.55),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,metalness:.25,roughness:.45}));
 mesh.castShadow=true;g.add(mesh);
 const light=new THREE.PointLight(color,1.3,5);g.add(light);
 g.userData={type,baseY:.65};pickups.push(g);
}
makePickup(-4,24,'part');makePickup(4,-5,'part');makePickup(-3,-37,'part');
makePickup(5,17,'ammo');makePickup(-5,-17,'med');

let health=100,ammo=12,reserve=48,parts=0,active=false,ended=false,shootCooldown=0,reloadTimer=0,damageCooldown=0,toastTimer=0;
const keys={};let yaw=0,pitch=-.12,mouseDown=false,moveStick={x:0,y:0},touchLook=null;
const raycaster=new THREE.Raycaster();
const tempV=new THREE.Vector3();
function showToast(msg){ui.toast.textContent=msg;ui.toast.style.opacity=1;toastTimer=2.2;}
function updateHud(){ui.health.style.width=health+'%';ui.healthValue.textContent=Math.ceil(health);ui.ammo.textContent=ammo;ui.reserve.textContent=reserve;ui.parts.textContent=parts+' / 3';ui.objective.textContent=parts<3?'OBJECTIVE: FIND '+(3-parts)+' SIGNAL PART'+(3-parts===1?'':'S'):'OBJECTIVE: REACH EXTRACTION GATE';}
function endGame(win){
 ended=true;active=false;ui.end.classList.remove('hidden');ui.endEyebrow.textContent=win?'EXTRACTION CONFIRMED':'MISSION FAILED';ui.endTitle.textContent=win?'YOU MADE IT OUT':'YOU DID NOT SURVIVE';ui.endText.textContent=win?'The signal is live. A rescue team has your coordinates. For now, you are alive.':'The quarantine zone has claimed another survivor. The city remains silent.';
 if(document.pointerLockElement)document.exitPointerLock();
}
function damage(amount){if(damageCooldown>0||ended)return;health=Math.max(0,health-amount);damageCooldown=.75;ui.flash.style.background='rgba(180,10,10,.3)';setTimeout(()=>ui.flash.style.background='rgba(180,10,10,0)',120);updateHud();if(health<=0)endGame(false);}
function reload(){if(!active||reloadTimer>0||ammo===12||reserve<=0)return;reloadTimer=1.15;showToast('RELOADING');}
function shoot(){
 if(!active||shootCooldown>0||reloadTimer>0)return;
 if(ammo<=0){showToast('MAGAZINE EMPTY — PRESS R');return;}
 ammo--;shootCooldown=.28;updateHud();
 // Camera-centred shot with a slight spread
 raycaster.setFromCamera(new THREE.Vector2(0,0),camera);raycaster.far=48;
 const targets=zombies.map(z=>z.userData.parts[1]);
 const hit=raycaster.intersectObjects(targets,false)[0];
 if(hit){
  const z=zombies.find(v=>v.userData.parts.includes(hit.object));
  if(z){z.userData.hp--;hit.object.material=mats.blood; if(z.userData.hp<=0){world.remove(z);zombies.splice(zombies.indexOf(z),1);showToast('TARGET ELIMINATED');}}
 }
 // muzzle flash
 const flash=new THREE.PointLight(0xffa45e,3,5);flash.position.copy(player.position).add(new THREE.Vector3(0,1.4,0));scene.add(flash);setTimeout(()=>scene.remove(flash),55);
}
function interact(){
 if(!active)return;
 const near=pickups.find(p=>p.position.distanceTo(player.position)<2.1);
 if(near){
  if(near.userData.type==='part'){parts++;showToast('SIGNAL PART RECOVERED');}
  if(near.userData.type==='ammo'){reserve=Math.min(120,reserve+18);showToast('AMMUNITION +18');}
  if(near.userData.type==='med'){health=Math.min(100,health+35);showToast('MEDICAL SUPPLIES USED');}
  world.remove(near);pickups.splice(pickups.indexOf(near),1);updateHud();return;
 }
 if(parts>=3&&player.position.distanceTo(new THREE.Vector3(0,0,-47))<6){endGame(true);return;}
}
function start(){
 ui.start.classList.add('hidden');active=true;ended=false;health=100;ammo=12;reserve=48;parts=0;
 player.position.set(0,0,35);yaw=0;pitch=-.12;
 // reset pickups and zombies for replay handled by reload
 updateHud();showToast('FIND THE THREE SIGNAL PARTS');
 if(matchMedia('(pointer:fine)').matches)renderer.domElement.requestPointerLock?.();
}
ui.startBtn.addEventListener('click',start);
ui.restart.addEventListener('click',()=>location.reload());
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyR')reload();if(e.code==='KeyE')interact();if(e.code==='Escape'&&active){active=false;ui.start.classList.remove('hidden');ui.startBtn.textContent='RESUME';}});
document.addEventListener('keyup',e=>keys[e.code]=false);
document.addEventListener('mousemove',e=>{if(active&&document.pointerLockElement){yaw-=e.movementX*.0022;pitch=Math.max(-.48,Math.min(.28,pitch-e.movementY*.0017));}});
document.addEventListener('mousedown',e=>{if(e.button===0&&active){if(document.pointerLockElement)shoot();else mouseDown=true;}});
document.addEventListener('mouseup',()=>mouseDown=false);
renderer.domElement.addEventListener('click',()=>{if(active&&matchMedia('(pointer:fine)').matches&&!document.pointerLockElement)renderer.domElement.requestPointerLock?.();});

// Mobile controls: virtual stick + drag-look
const stick=$('stick'),knob=$('stickKnob');let stickId=null,stickCenter={x:0,y:0};
stick.addEventListener('pointerdown',e=>{stickId=e.pointerId;stick.setPointerCapture(stickId);const r=stick.getBoundingClientRect();stickCenter={x:r.left+r.width/2,y:r.top+r.height/2};moveStick={x:0,y:0};});
stick.addEventListener('pointermove',e=>{if(e.pointerId!==stickId)return;let dx=e.clientX-stickCenter.x,dy=e.clientY-stickCenter.y;const len=Math.hypot(dx,dy),max=38;if(len>max){dx=dx/len*max;dy=dy/len*max;}moveStick={x:dx/max,y:dy/max};knob.style.transform=`translate(${dx}px,${dy}px)`;});
function resetStick(){stickId=null;moveStick={x:0,y:0};knob.style.transform='translate(0,0)';}
stick.addEventListener('pointerup',resetStick);stick.addEventListener('pointercancel',resetStick);
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&active)touchLook={x:e.clientX,y:e.clientY,id:e.pointerId};});
renderer.domElement.addEventListener('pointermove',e=>{if(touchLook&&e.pointerId===touchLook.id){yaw-=(e.clientX-touchLook.x)*.006;pitch=Math.max(-.48,Math.min(.28,pitch-(e.clientY-touchLook.y)*.004));touchLook={x:e.clientX,y:e.clientY,id:e.pointerId};}});
renderer.domElement.addEventListener('pointerup',e=>{if(touchLook&&e.pointerId===touchLook.id)touchLook=null;});
$('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();shoot();});
$('reloadBtn').addEventListener('pointerdown',e=>{e.preventDefault();reload();});
$('interactBtn').addEventListener('pointerdown',e=>{e.preventDefault();interact();});
let sprintTouch=false;$('sprintBtn').addEventListener('pointerdown',()=>sprintTouch=true);$('sprintBtn').addEventListener('pointerup',()=>sprintTouch=false);$('sprintBtn').addEventListener('pointerleave',()=>sprintTouch=false);

function updatePlayer(dt){
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-moveStick.y;
 const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+moveStick.x;
 const fwd=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
 const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
 const dir=fwd.multiplyScalar(forward).add(right.multiplyScalar(strafe));
 if(dir.lengthSq()>1)dir.normalize();
 const sprint=keys.ShiftLeft||keys.ShiftRight||sprintTouch;
 const speed=sprint?6.5:4.1;
 const next=player.position.clone().addScaledVector(dir,speed*dt);
 let blocked=false;
 for(const c of colliders){if(Math.abs(next.x-c.x)<c.w/2+.55&&Math.abs(next.z-c.z)<c.d/2+.55)blocked=true;}
 if(!blocked){player.position.copy(next);}
 if(dir.lengthSq()>.01){body.rotation.y=Math.atan2(dir.x,dir.z);body.position.y=Math.sin(performance.now()*.012)*.035;}
 camera.position.set(player.position.x+Math.sin(yaw)*5.8,player.position.y+3.15,player.position.z+Math.cos(yaw)*5.8);
 const look=new THREE.Vector3(player.position.x-Math.sin(yaw)*2,player.position.y+1.45+pitch*3,player.position.z-Math.cos(yaw)*2);
 camera.lookAt(look);
 // keep camera from clipping into ground
}
function updateZombies(dt,t){
 for(const z of zombies){
  const to=player.position.clone().sub(z.position);const dist=to.length();z.userData.phase+=dt*5;
  if(dist>1.25){to.normalize();z.position.addScaledVector(to,dt*(dist<13?1.65:0.75));z.rotation.y=Math.atan2(to.x,to.z);z.position.y=0;}
  else {z.userData.attack-=dt;if(z.userData.attack<=0){damage(9);z.userData.attack=1.15;}}
  const p=z.userData.parts;p[2].rotation.x=Math.sin(t*5+z.userData.phase)*.22;p[3].rotation.x=-Math.sin(t*5+z.userData.phase)*.22;
  p[0].rotation.z=Math.sin(t*2+z.userData.phase)*.04;
 }
}
function updatePickups(t){
 pickups.forEach(p=>{p.rotation.y+=.012;p.position.y=p.userData.baseY+Math.sin(t*2+p.position.x)*.12;});
 let near=pickups.some(p=>p.position.distanceTo(player.position)<2.1);
 const atGate=parts>=3&&player.position.distanceTo(new THREE.Vector3(0,0,-47))<6;
 ui.hint.style.display=(near||atGate)?'block':'none';
 ui.hint.textContent=near?'PRESS E / USE TO PICK UP':atGate?'PRESS E / USE TO EXTRACT':'';
}
function loop(){
 requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
 if(active&&!ended){
  updatePlayer(dt);updateZombies(dt,t);updatePickups(t);
  if(shootCooldown>0)shootCooldown-=dt;if(damageCooldown>0)damageCooldown-=dt;
  if(reloadTimer>0){reloadTimer-=dt;if(reloadTimer<=0){const n=Math.min(12-ammo,reserve);ammo+=n;reserve-=n;updateHud();showToast('RELOADED');}}
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.style.opacity=0;}
  if(mouseDown&&matchMedia('(pointer:fine)').matches)shoot();
 }
 renderer.render(scene,camera);
}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
addEventListener('resize',resize);
updateHud();
camera.position.set(0,3,42);camera.lookAt(0,1,35);
loop();
setTimeout(()=>ui.loading.style.display='none',700);
