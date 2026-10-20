const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function runnerPose(t){
 const frequency=170/120,phase=((t*frequency)%1+1)%1;
 const hip=[0,4+5*Math.cos(4*Math.PI*(phase-.15))];
 const shoulder=[14+1.2*Math.sin(phase*2*Math.PI),hip[1]-98];
 const endAngle=.60,endX=-51-25*Math.cos(endAngle)+11*Math.sin(endAngle);
 const endY=170-25*Math.sin(endAngle)-11*Math.cos(endAngle);
 // u, ankle x/y, shoe pitch, and derivatives with respect to stride phase.
 const recovery=[
  [.40,endX,endY,.60,-270,0,0],
  [.50,-75,96,.90,45,-450,0],
  [.60,-49,83,.58,380,70,-4],
  [.70,-4,108,.12,520,360,-3],
  [.82,46,143,-.10,190,190,0],
  [.90,50,153,-.06,-50,80,.7],
  [1.00,32,159,0,-270,0,0]
 ];
 const hermite=(a,b,ma,mb,q,span)=>{
  const q2=q*q,q3=q2*q;
  return (2*q3-3*q2+1)*a+(q3-2*q2+q)*span*ma+(-2*q3+3*q2)*b+(q3-q2)*span*mb;
 };
 function leg(u){
  let ankle,angle;
  if(u<.4){
   const stance=u/.4;angle=.6*smooth((stance-.70)/.30);
   const toeX=57-108*stance;
   ankle=[toeX-25*Math.cos(angle)+11*Math.sin(angle),170-25*Math.sin(angle)-11*Math.cos(angle)];
  }else{
   let j=0;while(j<recovery.length-2&&u>recovery[j+1][0])j++;
   const a=recovery[j],b=recovery[j+1],span=b[0]-a[0],q=(u-a[0])/span;
   ankle=[hermite(a[1],b[1],a[4],b[4],q,span),hermite(a[2],b[2],a[5],b[5],q,span)];
   angle=hermite(a[3],b[3],a[6],b[6],q,span);
  }
  const dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],distance=Math.hypot(dx,dy);
  const thigh=83,shank=82,along=(thigh*thigh-shank*shank+distance*distance)/(2*distance);
  const bend=Math.sqrt(Math.max(0,thigh*thigh-along*along));
  const knee=[hip[0]+dx/distance*along+dy/distance*bend,hip[1]+dy/distance*along-dx/distance*bend];
  return {u,knee,ankle,angle,distance,contact:u<.4};
 }
 function arm(u,far){
  const swing=.04-.52*Math.cos(2*Math.PI*(u-.02));
  const root=[shoulder[0]+(far?-5:2),shoulder[1]+3];
  const elbow=[root[0]+53*Math.sin(swing),root[1]+53*Math.cos(swing)];
  const forearm=Math.PI/2-swing-(1.63+.10*Math.sin(2*Math.PI*u));
  const wrist=[elbow[0]+45*Math.cos(forearm),elbow[1]+45*Math.sin(forearm)];
  return {root,elbow,wrist};
 }
 return {hip,shoulder,near:leg(phase),far:leg((phase+.5)%1),nearArm:arm(phase,false),farArm:arm((phase+.5)%1,true),beltSpeed:270*frequency};
}

// Rig units use y downward. Fixed segments; not motion-capture data.
function lifterPose(t){
 const u=((t/4)%1+1)%1,progress=u<.4?smooth(u/.4):1-smooth((u-.4)/.6),flex=(25+100*progress)*Math.PI/180;
 const legs=[-1,1].map(side=>{let hip=[side*17,0,0],knee=[side*17,Math.sqrt(80*80-36),6],ankle=[side*17,Math.sqrt(80*80-36)+Math.sqrt(79*79-36),0];return {hip,knee,ankle};});
 const arms=[-1,1].map(side=>{let shoulder=[side*36,-98,0],elbow=[side*36,-48,0],wrist=[side*36,-48+43*Math.cos(flex),43*Math.sin(flex)];return {shoulder,elbow,wrist};});
 return {legs,arms,flex,progress};
}
function link3(a,b,r,color){let v=b.map((x,i)=>x-a[i]),length=Math.hypot(...v),Y=v.map(x=>x/length),X=Math.abs(Y[2])<.9?[Y[1],-Y[0],0]:[0,Y[2],-Y[1]],d=Math.hypot(...X);X=X.map(x=>x/d);let Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]];sphere(...a.map((x,i)=>(x+b[i])/2),r,length/2,r,color,0,[...X,...Y,...Z]);}
function drawRunner(x,y,scale,t){
 const pose=runnerPose(t),P=(a,z=0)=>[x+a[0]*scale,y-a[1]*scale,z*scale];
 const segment=(a,b,r,color,z)=>{link3(P(a,z),P(b,z),r*scale,color);for(let q of [a,b])sphere(...P(q,z),r*scale,r*scale,r*scale,color);};
 const skin=[.72,.85,.90,1],far=[.47,.65,.74,1],shirt=[.37,.66,.81,1];
 function leg(l,z,color){segment(pose.hip,l.knee,9,color,z);segment(l.knee,l.ankle,6.5,color,z);let center=[l.ankle[0]+6*Math.cos(l.angle)-5*Math.sin(l.angle),l.ankle[1]+6*Math.sin(l.angle)+5*Math.cos(l.angle)];sphere(...P(center,z),20*scale,6*scale,8*scale,blue,-l.angle);let toe=[l.ankle[0]+25*Math.cos(l.angle)-11*Math.sin(l.angle),l.ankle[1]+25*Math.sin(l.angle)+11*Math.cos(l.angle)-3];sphere(...P(toe,z),3*scale,3*scale,6*scale,blue);}
 function arm(a,z,color){segment(a.root,a.elbow,6,color,z);segment(a.elbow,a.wrist,5,color,z);sphere(...P(a.wrist,z),6*scale,7*scale,5*scale,color);}
 arm(pose.farArm,-19,far);leg(pose.far,-15,far);leg(pose.near,15,skin);
 let h=pose.hip[1],sh=pose.shoulder;
 segment([sh[0],sh[1]+5],[2,h-18],18,shirt,0);sphere(...P([1,h-6]),21*scale,18*scale,16*scale,blue);
 segment([sh[0]+3,h-103],[sh[0]+9,h-119],6,skin,0);
 let head=[sh[0]+11,h-137];sphere(...P(head),15*scale,22*scale,16*scale,skin,-.08);sphere(...P([head[0]+14,head[1]+1],4),6*scale,4*scale,6*scale,skin);sphere(...P([head[0]+10,head[1]-5],14),1.7*scale,1.7*scale,1.7*scale,blue);
 sphere(...P([head[0]-1,head[1]-4],17),8*scale,10*scale,4*scale,coral);sphere(...P([sh[0]+5,sh[1]+26],21),7*scale,10*scale,4*scale,coral);sphere(...P([3,h-28],19),4*scale,5*scale,3*scale,coral);sphere(...P([2,h-7],20),4*scale,4*scale,3*scale,coral);
 arm(pose.nearArm,30,skin);
}
function drawLifter(x,y,scale,t){
 const pose=lifterPose(t),az=.65,co=Math.cos(az),si=Math.sin(az),P=a=>[x+(a[0]*co+a[2]*si)*scale,y-a[1]*scale,(-a[0]*si+a[2]*co)*scale];
 const skin=[.72,.85,.90,1],shirt=[.37,.66,.81,1];
 function joint(a,r,color){sphere(...P(a),r*scale,r*scale,r*scale,color);}
 function segment(a,b,r,color){link3(P(a),P(b),r*scale,color);joint(a,r,color);joint(b,r,color);}
 for(let l of pose.legs){segment(l.hip,l.knee,9,skin);segment(l.knee,l.ankle,6.5,skin);let q=[l.ankle[0],l.ankle[1]+5,9];turn=az;sphere(...P(q),9*scale,6*scale,19*scale,blue);turn=0;}
 turn=az;sphere(...P([0,-54,0]),32*scale,44*scale,17*scale,shirt);sphere(...P([0,-8,0]),24*scale,19*scale,17*scale,blue);turn=0;
 segment([0,-97,0],[0,-116,0],7,skin);turn=az;sphere(...P([0,-137,0]),15*scale,22*scale,17*scale,skin);turn=0;joint([0,-134,17],5,skin);
 sphere(...P([0,-141,16]),9*scale,10*scale,5*scale,coral);sphere(...P([-5,-71,17]),7*scale,10*scale,4*scale,coral);for(let side of [-1,1]){joint([side*9,-31,17],4,coral);joint([side*8,-8,17],4,coral);}
 for(let a of pose.arms){segment(a.shoulder,a.elbow,7,skin);segment(a.elbow,a.wrist,5.5,skin);joint(a.wrist,6,skin);let ends=[-15,15].map(d=>[a.wrist[0]+d,a.wrist[1],a.wrist[2]]);link3(P(ends[0]),P(ends[1]),2.4*scale,blue);for(let q of ends){let axis=P([q[0]+1,q[1],q[2]]).map((v,i)=>v-P(q)[i]),Y=axis.map(v=>v/scale),X=[0,1,0],Z=[-Y[2],0,Y[0]];sphere(...P(q),12*scale,4*scale,12*scale,blue,0,[...X,...Y,...Z]);}}
}



