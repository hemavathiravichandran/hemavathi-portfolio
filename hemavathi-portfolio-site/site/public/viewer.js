(function(){
var T=THREE;function $(i){return document.getElementById(i)}
function mat(c,o){return new T.MeshStandardMaterial(Object.assign({color:c,roughness:.5},o||{}))}
var PLA=mat(0xF2F5F6),PLA2=mat(0xF2F5F6,{side:T.DoubleSide}),TEAL=mat(0x0F8B8D),OLIVE=mat(0x6B7A2A),DARK=mat(0x10242E),SKY=mat(0x9CCBE0,{transparent:true,opacity:.75}),BONE=mat(0xE9DFC9,{flatShading:true,roughness:.6});
function box(w,h,d,m,x,y,z){var b=new T.Mesh(new T.BoxGeometry(w,h,d),m);b.position.set(x||0,y||0,z||0);return b}
function cyl(r,h,m,x,y,z,rx,rz){var c=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m);c.position.set(x||0,y||0,z||0);c.rotation.x=rx||0;c.rotation.z=rz||0;return c}
function ball(r,m,x,y,z){var s=new T.Mesh(new T.SphereGeometry(r,12,10),m);s.position.set(x,y,z);return s}
function lights(s){s.add(new T.AmbientLight(0xffffff,.75));var l=new T.DirectionalLight(0xffffff,.9);l.position.set(4,7,6);s.add(l);}
function parseSTL(buf){var dv=new DataView(buf),n=dv.getUint32(80,true),pos=[];
 if(84+n*50===buf.byteLength){for(var i=0;i<n;i++){var o=84+i*50+12;for(var v=0;v<3;v++)for(var k=0;k<3;k++)pos.push(dv.getFloat32(o+v*12+k*4,true));}}
 else{var t=new TextDecoder().decode(buf),re=/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g,m;while((m=re.exec(t)))pos.push(+m[1],+m[2],+m[3]);}
 var ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.computeVertexNormals();return ge;}

function rehab(){var g=new T.Group();
 [2.1,-2.1].forEach(function(y){var s=new T.Mesh(new T.CylinderGeometry(1.35,1.35,.7,48,1,true),PLA2);s.position.y=y;g.add(s);
  var rim=new T.Mesh(new T.TorusGeometry(1.35,.05,8,48),TEAL);rim.rotation.x=Math.PI/2;rim.position.y=y+.35;g.add(rim);});
 [-1.5,1.5].forEach(function(x){g.add(box(.25,4.9,.25,PLA,x,0,0));[2.1,-2.1].forEach(function(y){g.add(ball(.1,DARK,x,y,.15));});});
 g.add(box(1.2,1.8,.8,PLA,-2.6,-.7,0),box(.7,.4,.05,DARK,-2.6,-.4,.43),box(.9,.9,.9,TEAL,2.3,-.9,0),cyl(.2,.3,DARK,2.3,-.9,.6,Math.PI/2));
 g.position.y=0;return g;}
function breath(){var g=new T.Group();
 g.add(cyl(.45,2.2,PLA,-2.6,0,0,0,Math.PI/2),cyl(.9,1.4,TEAL,-.9,0,0,0,Math.PI/2),cyl(.12,1.2,DARK,.5,0,0,0,Math.PI/2));
 [-1.4,-.9,-.4].forEach(function(x){g.add(cyl(.2,.5,DARK,x,1.05,0));});
 g.add(box(2.2,1.6,1.4,PLA,2,0,0),box(1.2,.6,.06,DARK,2,.2,.73),ball(.07,OLIVE,1.5,-.4,.73),ball(.07,OLIVE,1.8,-.4,.73));
 [[-4.2,.1,0,.2],[-4.8,.4,.2,.15],[-5.2,-.2,-.1,.12],[-4.6,-.3,.3,.1]].forEach(function(p){g.add(ball(p[3],SKY,p[0],p[1],p[2]));});
 g.position.x=.9;g.rotation.x=.2;return g;}

var el=$('stage'),R=new T.WebGLRenderer({antialias:true,alpha:true}),S=new T.Scene(),C=new T.PerspectiveCamera(40,1,.1,100);
R.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(R.domElement);lights(S);
var caps=["CanineBone AI scaffold: my real STL file, a porous lattice scaffold for repairing a canine mandibular defect.",
"Rehabilitation assist device: upper and lower limb straps, adjustable vertical supports, a servo actuator and a control box. Based on my CAD design (520 × 280 × 160 mm, PLA).",
"Breath-based cancer screening system: a breath mouthpiece, a gas sensing chamber with sensors, and a control unit with a display."];
var models=[new T.Group(),rehab(),breath()],cur=0,ry=.6,drag=false,lx=0,calm=matchMedia('(prefers-reduced-motion: reduce)').matches;
models.forEach(function(m,i){m.visible=i===0;S.add(m);});
fetch('canine.stl').then(function(r){return r.arrayBuffer();}).then(function(b){var ge=parseSTL(b);ge.computeBoundingBox();var bb=ge.boundingBox,c=new T.Vector3();bb.getCenter(c);ge.translate(-c.x,-c.y,-c.z);
 var sz=bb.getSize(new T.Vector3()),k=6/Math.max(sz.x,sz.y,sz.z),m=new T.Mesh(ge,BONE);m.scale.setScalar(k);m.rotation.x=-Math.PI/2;models[0].add(m);models[0].rotation.x=.5;})
 .catch(function(){$('capText').textContent='Could not load canine.stl. Start the site with node server.js.';});
el.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;el.style.cursor='grabbing';el.setPointerCapture(e.pointerId);});
el.addEventListener('pointermove',function(e){if(drag){ry+=(e.clientX-lx)*.01;lx=e.clientX;}});
['pointerup','pointercancel'].forEach(function(n){el.addEventListener(n,function(){drag=false;el.style.cursor='grab';});});
function size(){var w=el.clientWidth,h=el.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.position.set(0,2.2,w<600?13:9.5);C.lookAt(0,0,0);C.updateProjectionMatrix();}
addEventListener('resize',size);size();
function show(i){cur=i;models.forEach(function(m,j){m.visible=j===i;});if(i!==0)$('capText').textContent=caps[i];else $('capText').textContent=caps[0];
 $('cadb').hidden=i!==1;document.querySelectorAll('#tabs button').forEach(function(b){b.setAttribute('aria-pressed',+b.dataset.i===i);});}
$('tabs').addEventListener('click',function(e){var b=e.target.closest('button');if(b)show(+b.dataset.i);});show(0);
(function lp(){requestAnimationFrame(lp);if(!drag&&!calm)ry+=.005;models[cur].rotation.y=ry;R.render(S,C);})();

function orbit(t,c,d,h){c.position.set(Math.sin(t*.18)*d,h,Math.cos(t*.18)*d);c.lookAt(0,0,0);}
function apollo(){var g=new T.Group(),wm=mat(0x6FA8C4),gr=new T.Mesh(new T.PlaneGeometry(16,16),mat(0xDCEBD0));gr.rotation.x=-Math.PI/2;gr.position.y=-1.5;g.add(gr);
 g.add(box(5,3,2.6,PLA,0,0,0),box(1.2,.35,.35,TEAL,0,2.2,0),box(.35,1.2,.35,TEAL,0,2.2,0),box(.8,1,.06,TEAL,0,-1,1.31));
 [0,.6,1.2].forEach(function(y){[-2,-1,0,1,2].forEach(function(x){g.add(box(.55,.4,.05,wm,x,y,1.31));});});
 var a=new T.Group();a.add(box(1.3,.6,.6,PLA),box(.5,.45,.55,PLA,.9,-.08,0),box(1.3,.12,.62,TEAL),box(.2,.12,.2,OLIVE,0,.36,0));
 [[-.4,.32],[.4,.32],[-.4,-.32],[.4,-.32]].forEach(function(p){a.add(cyl(.17,.12,DARK,p[0],-.38,p[1],Math.PI/2));});g.add(a);
 return{title:'Apollo Hospital, Chennai',obj:g,caps:['Apollo Hospital, Greams Road, Chennai','Hospital intern, Biomedical · 9–23 Mar 2026','Observed clinical procedures','Exposure to hospital equipment and patient care'],
 update:function(t,c){var an=t*.7;a.position.set(Math.cos(an)*4.2,-1.15,Math.sin(an)*4.2);a.rotation.y=-(an+Math.PI/2);orbit(t,c,9.5,3.6);}};}
function medsby(){var g=new T.Group(),fl=new T.Mesh(new T.PlaneGeometry(16,16),mat(0xEAF3F7));fl.rotation.x=-Math.PI/2;fl.position.y=-1.6;g.add(fl);
 g.add(box(5,.3,4,mat(0x2A3F47),0,-1.45,0),box(3.2,.1,2.6,PLA,0,-1.25,0),box(4.8,.2,.2,PLA,0,1.4,-1.8),box(4.8,.2,.2,PLA,0,1.4,1.8));
 [[-2.3,-1.8],[2.3,-1.8],[-2.3,1.8],[2.3,1.8]].forEach(function(p){g.add(box(.2,3,.2,PLA,p[0],0,p[1]));});
 var gan=box(.2,.2,3.8,TEAL,0,1.4,0),head=new T.Group(),cone=new T.Mesh(new T.ConeGeometry(.12,.4,12),DARK),rod=cyl(.03,1,DARK),ob=box(1.6,1,1.2,mat(0x6B7A2A,{transparent:true,opacity:.85}));
 cone.rotation.x=Math.PI;cone.position.y=-.35;head.add(box(.5,.4,.5,OLIVE),cone);g.add(gan,head,rod,ob,box(1.8,.1,1.2,TEAL,4.3,-1.25,0),box(.5,.12,.5,DARK,4.1,-1.15,.1),box(.3,.1,.3,DARK,4.6,-1.15,-.2));
 return{title:'Medsby, Coimbatore',obj:g,caps:['Medsby, Coimbatore','Embedded System and 3D Bioprinting Intern · 13–28 Jun 2025','Embedded systems for healthcare','3D bioprinting: building a scaffold layer by layer'],
 update:function(t,c){var h=Math.max(.03,(t%9)/9),x=Math.sin(t*1.4)*.7,z=Math.sin(t*5)*.5,y=-1.2+h+.45;ob.scale.y=h;ob.position.y=-1.2+h/2;head.position.set(x,y,z);gan.position.x=x;
  rod.scale.y=1.4-y;rod.position.set(x,(1.4+y)/2,z);orbit(t,c,9.5,3.4);}};}

var cleanup=null,vd=$('vd');
function vid(k){var sc=k==='apollo'?apollo():medsby();$('vt').textContent=sc.title;var host=$('vb');host.innerHTML='<div class="vstage"></div>';var st=host.firstChild;
 var r=new T.WebGLRenderer({antialias:true});r.setClearColor(0xCFE9F5);r.setPixelRatio(Math.min(devicePixelRatio,2));st.appendChild(r.domElement);
 var s=new T.Scene(),c=new T.PerspectiveCamera(42,1,.1,100);lights(s);s.add(sc.obj);vd.showModal();
 function rs(){r.setSize(st.clientWidth,st.clientHeight,false);c.aspect=st.clientWidth/st.clientHeight;c.updateProjectionMatrix();}rs();
 var t=0,last=performance.now(),run=!calm,id,p=$('vp');p.hidden=false;$('vc').hidden=false;p.textContent=run?'Pause':'Play';p.onclick=function(){run=!run;p.textContent=run?'Pause':'Play';};
 (function lp(){id=requestAnimationFrame(lp);var n=performance.now();if(run)t+=(n-last)/1000;last=n;sc.update(t,c);$('vc').textContent=sc.caps[Math.floor(t/3)%sc.caps.length];r.render(s,c);})();
 cleanup=function(){cancelAnimationFrame(id);r.dispose();host.innerHTML='';};}
function cad(){$('vt').textContent='Rehabilitation assist device: CAD design';$('vb').innerHTML='<img class="pimg" src="rehab-cad.jpg" alt="CAD design sheet of the rehabilitation assist device with views and dimensions">';$('vp').hidden=true;$('vc').hidden=true;vd.showModal();}
vd.addEventListener('close',function(){if(cleanup){cleanup();cleanup=null;}});
$('vx').onclick=function(){vd.close();};
document.addEventListener('click',function(e){var b=e.target.closest('[data-v]');if(b){if(b.dataset.v==='cad')cad();else vid(b.dataset.v);}if(e.target===vd)vd.close();});
})();
