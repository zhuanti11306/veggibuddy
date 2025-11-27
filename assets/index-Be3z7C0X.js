import{G as xe,g as re,m as _e,p as Te,I as ze,f as Le,s as V,c as k,t as Pe,k as Ee,l as Ae,d as Be}from"./index-CiVeqNK5.js";import{j as Ce,L as Ue,C as U,M as Me,N as De,z as X,O as ke,p as $,S as Ie,Q as Y,n as J,v as W}from"./index-DfbJhxeW.js";import{I as Fe,F as le,a as ne,b as D,W as Ve,B as oe,S as me,V as d,c as We,d as H,U as ge,e as ie,f as O,M as ve,g as I,L as Ge,h as Re,i as qe,j as Ne,k as He,s as G}from"./GLTFLoader-CQaeW04e.js";const ce=new oe,R=new d;class we extends Fe{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";const e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new le(e,3)),this.setAttribute("uv",new le(t,2))}applyMatrix4(e){const t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new ne(t,6,1);return this.setAttribute("instanceStart",new D(i,3,0)),this.setAttribute("instanceEnd",new D(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));const i=new ne(t,6,1);return this.setAttribute("instanceColorStart",new D(i,3,0)),this.setAttribute("instanceColorEnd",new D(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Ve(e.geometry)),this}fromLineSegments(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oe);const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),ce.setFromBufferAttribute(t),this.boundingBox.union(ce))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new me),this.boundingBox===null&&this.computeBoundingBox();const e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){const i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let c=0,a=e.count;c<a;c++)R.fromBufferAttribute(e,c),n=Math.max(n,i.distanceToSquared(R)),R.fromBufferAttribute(t,c),n=Math.max(n,i.distanceToSquared(R));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}}O.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ie(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};H.line={uniforms:ge.merge([O.common,O.fog,O.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};class se extends We{constructor(e){super({type:"LineMaterial",uniforms:ge.clone(H.line.uniforms),vertexShader:H.line.vertexShader,fragmentShader:H.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}}const Q=new I,de=new d,ue=new d,S=new I,b=new I,E=new I,Z=new d,ee=new Re,x=new Ge,fe=new d,q=new oe,N=new me,A=new I;let B,M;function pe(o,e,t){return A.set(0,0,-e,1).applyMatrix4(o.projectionMatrix),A.multiplyScalar(1/A.w),A.x=M/t.width,A.y=M/t.height,A.applyMatrix4(o.projectionMatrixInverse),A.multiplyScalar(1/A.w),Math.abs(Math.max(A.x,A.y))}function Oe(o,e){const t=o.matrixWorld,i=o.geometry,n=i.attributes.instanceStart,c=i.attributes.instanceEnd,a=Math.min(i.instanceCount,n.count);for(let s=0,l=a;s<l;s++){x.start.fromBufferAttribute(n,s),x.end.fromBufferAttribute(c,s),x.applyMatrix4(t);const u=new d,f=new d;B.distanceSqToSegment(x.start,x.end,f,u),f.distanceTo(u)<M*.5&&e.push({point:f,pointOnLine:u,distance:B.origin.distanceTo(f),object:o,face:null,faceIndex:s,uv:null,uv1:null})}}function Ye(o,e,t){const i=e.projectionMatrix,c=o.material.resolution,a=o.matrixWorld,s=o.geometry,l=s.attributes.instanceStart,u=s.attributes.instanceEnd,f=Math.min(s.instanceCount,l.count),r=-e.near;B.at(1,E),E.w=1,E.applyMatrix4(e.matrixWorldInverse),E.applyMatrix4(i),E.multiplyScalar(1/E.w),E.x*=c.x/2,E.y*=c.y/2,E.z=0,Z.copy(E),ee.multiplyMatrices(e.matrixWorldInverse,a);for(let h=0,_=f;h<_;h++){if(S.fromBufferAttribute(l,h),b.fromBufferAttribute(u,h),S.w=1,b.w=1,S.applyMatrix4(ee),b.applyMatrix4(ee),S.z>r&&b.z>r)continue;if(S.z>r){const m=S.z-b.z,v=(S.z-r)/m;S.lerp(b,v)}else if(b.z>r){const m=b.z-S.z,v=(b.z-r)/m;b.lerp(S,v)}S.applyMatrix4(i),b.applyMatrix4(i),S.multiplyScalar(1/S.w),b.multiplyScalar(1/b.w),S.x*=c.x/2,S.y*=c.y/2,b.x*=c.x/2,b.y*=c.y/2,x.start.copy(S),x.start.z=0,x.end.copy(b),x.end.z=0;const p=x.closestPointToPointParameter(Z,!0);x.at(p,fe);const T=qe.lerp(S.z,b.z,p),z=T>=-1&&T<=1,P=Z.distanceTo(fe)<M*.5;if(z&&P){x.start.fromBufferAttribute(l,h),x.end.fromBufferAttribute(u,h),x.start.applyMatrix4(a),x.end.applyMatrix4(a);const m=new d,v=new d;B.distanceSqToSegment(x.start,x.end,v,m),t.push({point:v,pointOnLine:m,distance:B.origin.distanceTo(v),object:o,face:null,faceIndex:h,uv:null,uv1:null})}}}class Ke extends ve{constructor(e=new we,t=new se({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){const e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let a=0,s=0,l=t.count;a<l;a++,s+=2)de.fromBufferAttribute(t,a),ue.fromBufferAttribute(i,a),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+de.distanceTo(ue);const c=new ne(n,2,1);return e.setAttribute("instanceDistanceStart",new D(c,1,0)),e.setAttribute("instanceDistanceEnd",new D(c,1,1)),this}raycast(e,t){const i=this.material.worldUnits,n=e.camera;n===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');const c=e.params.Line2!==void 0&&e.params.Line2.threshold||0;B=e.ray;const a=this.matrixWorld,s=this.geometry,l=this.material;M=l.linewidth+c,s.boundingSphere===null&&s.computeBoundingSphere(),N.copy(s.boundingSphere).applyMatrix4(a);let u;if(i)u=M*.5;else{const r=Math.max(n.near,N.distanceToPoint(B.origin));u=pe(n,r,l.resolution)}if(N.radius+=u,B.intersectsSphere(N)===!1)return;s.boundingBox===null&&s.computeBoundingBox(),q.copy(s.boundingBox).applyMatrix4(a);let f;if(i)f=M*.5;else{const r=Math.max(n.near,q.distanceToPoint(B.origin));f=pe(n,r,l.resolution)}q.expandByScalar(f),B.intersectsBox(q)!==!1&&(i?Oe(this,t):Ye(this,n,t))}onBeforeRender(e){const t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Q),this.material.uniforms.resolution.value.set(Q.z,Q.w))}}class ye extends we{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){const t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e){const t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setColors(i),this}setFromPoints(e){const t=e.length-1,i=new Float32Array(6*t);for(let n=0;n<t;n++)i[6*n]=e[n].x,i[6*n+1]=e[n].y,i[6*n+2]=e[n].z||0,i[6*n+3]=e[n+1].x,i[6*n+4]=e[n+1].y,i[6*n+5]=e[n+1].z||0;return super.setPositions(i),this}fromLine(e){const t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class je extends Ke{constructor(e=new ye,t=new se({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}}function K(o,e,t){const i=t.clone().multiplyScalar(.5),n=e.clone(),c=o.clone();return{getTangent(a){return i.clone().multiplyScalar(2*a).add(n)},getPosition(a){const s=i.clone().multiplyScalar(a*a),l=n.clone().multiplyScalar(a);return s.add(l).add(c)},step(a,s,l){const u=[];for(let f=0;f<=l;f++){const r=a+(s-a)*f/l;u.push(this.getPosition(r))}return u}}}function Xe(o,e,t,i,n="low"){const c=t.clone().multiplyScalar(.5),a=e.clone().sub(o),s=a.lengthSq(),l=c.lengthSq(),u=a.dot(t),f=l,r=i*i+u,h=s,_=r*r-4*f*h;if(_<0)return null;const g=Math.sqrt(_),T=(r+(n==="high"?1:-1)*g)/(2*f);if(T<0)return null;const z=Math.sqrt(T),P=a.clone().multiplyScalar(1/z).sub(c.clone().multiplyScalar(z));return{duration:z,...K(o,P,t)}}const j=new d(0,-9.81,0);let C=null;const{promise:$e,resolve:Je}=Promise.withResolvers(),Qe=De.throwingGame.models.field,he=_e(()=>$.isLegal?{id:$.type,assets:ke[$.type]}:null),{promise:Ze,resolve:et}=Promise.withResolvers();let te=null;function tt(){xe(()=>{if(!re(he))return void Ce();const o=re(he).id;Promise.all([Ue(o),$e]).then(([e,{scene:t}])=>{e.model.object&&(t.add(e.model.object),e.model.object.position.set(0,0,.5),e.model.object.lookAt(new d(0,0,0))),te?.model.object&&t.remove(te.model.object),et(te=e)})})}const L={_state:0,start:{x:0,y:0},current:{x:0,y:0},get state(){return this._state},set state(o){if(this._state=o,!!C)switch(o){case 0:case 1:C.controls.enabled=!0;break;case 2:C.controls.enabled=!1;break}}};function nt(o,e,t){Y.setFromCamera(o,e),Y.intersectObject(t).length?(L.state=2,L.start.x=L.current.x=o.x,L.start.y=L.current.y=o.y):L.state=0}const it=function(o){const e=o.querySelector("canvas");if(!e)throw new Error("Canvas element not found in container.");const t=C=Me(o,e,Ie.throwingBallGame);Je(t);const i=ot(t.scene);let n=null;return Promise.all([Qe.whenLoaded,Ze]).then(([c,a])=>{t.info.gyroTuner.enable();const s=a.model.object,{animation:l,animationState:u,reset:f}=st(s,i);function r(g){const p=new ie(g.offsetX,g.offsetY).applyMatrix3(t.pointerNormalize);nt(p,t.camera,i.ball)}function h(g){switch(L.state){case 0:break;case 2:{const{offsetX:p,offsetY:T}=g;L.current.x=p,L.current.y=T;const z=new ie(p,T).applyMatrix3(t.pointerNormalize),P=new d,m=i.ball.position.distanceTo(t.camera.position);Y.setFromCamera(z,t.camera),Y.ray.at(m,P);const v=j,w=i.ball.position.clone(),y=new d().subVectors(w,P).multiply(new d(8,16,8)).multiplyScalar(1/m),F=new d(y.x,0,y.z),ae=2;if(F.length()>ae&&(F.setLength(ae),y.x=F.x,y.z=F.z),y.y>2&&(y.y=2),y.length()>=.0625){u.predictParabolaCurve=K(w,y,v);const be=u.predictParabolaCurve.step(0,.375,20);i.parabolaLine.geometry.setFromPoints(be),i.parabolaLine.computeLineDistances(),i.parabolaLine.geometry.attributes.position.needsUpdate=!0,i.parabolaLine.visible=!0}break}}}function _(g){switch(L.state){case 0:break;case 2:i.parabolaLine.visible=!1,u.throwParabolaCurve=u.predictParabolaCurve,u.predictParabolaCurve=null,u.hadFirstThrow=!0}L.state=0}X(l),o.addEventListener("pointerdown",r),o.addEventListener("pointermove",h),o.addEventListener("pointerup",_),n=()=>{U(l),u.moving?.animation&&U(u.moving.animation),o.removeEventListener("pointerdown",r),o.removeEventListener("pointermove",h),o.removeEventListener("pointerup",_)},Se=()=>{f(),s.position.set(0,0,.5),s.lookAt(new d(0,0,0)),i.ball.position.set(0,.025,.25),i.parabolaLine.visible=!1,t.camera.position.set(0,.0859375,-1/2**12),t.camera.lookAt(new d(0,.0859375,1))}}),{destroy(){t.dispose(),n?.()}}};function ot(o){const e=new ve(new Ne(.025,16,16),new He({color:16733525,roughness:.5,metalness:0}));e.castShadow=!0,e.receiveShadow=!0,o.add(e),e.position.set(0,.025,.25);const t=new je(new ye,new se({linewidth:3,color:16711680,dashed:!0,dashSize:.03125,gapSize:.0078125}));return t.visible=!1,o.add(t),{ball:e,parabolaLine:t}}function st(o,e){const t={hadFirstThrow:!1,chasingBallState:0,currentChasingTarget:null,allowKickBall:!1,ballStartMoving:null,ballThrowingTime:null,predictParabolaCurve:null,throwParabolaCurve:null,moving:null};function i(c,a){if(t.throwParabolaCurve){(t.ballStartMoving===null||t.ballThrowingTime===null)&&(t.ballThrowingTime=t.ballStartMoving=a);const s=a-t.ballThrowingTime,l=t.throwParabolaCurve.getPosition(s/1e3);if(e.ball.position.copy(l),a-t.ballStartMoving>250&&o.position.distanceTo(e.ball.position)>.1&&t.chasingBallState===0&&(t.chasingBallState=1),l.y<.025){e.ball.position.y=.025;const u=new d().copy(e.ball.position),f=new d().copy(t.throwParabolaCurve.getTangent(0));f.multiply(new d(.75,.5,.75)),f.x>.0078125||f.x<-.0078125||f.z>.0078125||f.z<-.0078125?(t.ballThrowingTime=a,t.throwParabolaCurve=K(u,f,j)):L.state===0&&(t.ballStartMoving=null,t.throwParabolaCurve=null)}}if(t.hadFirstThrow){const s=new d().copy(e.ball.position).setY(o.position.y);o.lookAt(s);const l=e.ball.position.distanceTo(o.position),f=new d().copy(s).setY(0).length();if((!t.throwParabolaCurve||t.chasingBallState)&&!t.moving){const r=new d().copy(e.ball.position).setY(o.position.y);let h=null;switch(t.chasingBallState){case 0:{l>.1?t.chasingBallState=1:Math.random()<.0025&&(t.allowKickBall=!0);break}case 1:{if(!t.currentChasingTarget){const _=new d(0,1,0),g=new d().copy(r).setY(0),p=new d().crossVectors(_,g).normalize().multiplyScalar(.085),T=new d().copy(r).sub(p),z=new d().copy(r).add(p),P=new d().copy(r).addScaledVector(g.normalize(),.085),m=T.distanceTo(o.position),v=z.distanceTo(o.position),w=P.distanceTo(o.position);switch(Math.min(m,v,w)){case w:t.currentChasingTarget=P;break;case m:t.currentChasingTarget=T;break;case v:t.currentChasingTarget=z;break}}new d().subVectors(t.currentChasingTarget,o.position).length()<.01?(t.currentChasingTarget=null,t.chasingBallState=2):h=t.currentChasingTarget;break}case 2:if(l>.1)t.chasingBallState=1;else{const g=new d().copy(r).setY(0).normalize().multiplyScalar(.085),p=new d().copy(r).add(g);p.distanceTo(o.position)>.01&&(h=p),t.chasingBallState=0}}if(h){h.setY(0);const _=new d().subVectors(h,o.position),g=_.length();if(_.normalize().multiplyScalar(g/Math.ceil(g/.25)),t.moving=at(o,o.position.clone(),o.position.clone().add(_)),t.moving){const p=t.moving.animation;X(p),t.moving.promise.then(()=>{t.moving=null,U(p)})}}}if(t.allowKickBall&&!t.predictParabolaCurve&&l<.1&&f>.5){const r=new d().subVectors(e.ball.position,o.position).setY(0).normalize();r.setY(.25),r.applyAxisAngle(new d(0,1,0),(Math.random()-.5)*Math.PI/8);const h=K(e.ball.position.clone(),r,j);t.throwParabolaCurve=h,t.ballThrowingTime=a,t.allowKickBall=!1}}}function n(){t.hadFirstThrow=!1,t.chasingBallState=0,t.currentChasingTarget=null,t.allowKickBall=!1,t.ballStartMoving=null,t.ballThrowingTime=null,t.predictParabolaCurve=null,t.throwParabolaCurve=null,t.moving?.animation&&U(t.moving.animation),t.moving=null}return{animation:i,animationState:t,reset:n}}function at(o,e,t,i=1.75){const n=Xe(e,t,j,i,"high");if(!n)return null;const{promise:c,resolve:a}=Promise.withResolvers(),s=250,l=n.duration*1e3,u=200,r=n.getTangent(0).length(),g=n.getTangent(n.duration).length()/r,p=o.scale.y;let T=!1;const z=.25;return{animation(P,m){let v=1;if(m<s){const w=m/s,y=w*w;v=1+z*.5*(3*y-2*w+Math.sqrt(8)*(y-w))}else if(m<s+l){const w=(m-s)/1e3,y=n.getTangent(w).length();v=1+z*(1-y/r),o.position.copy(n.getPosition(w))}else if(m<s+l+u){const w=(m-s-l)/u,y=w*w;v=1+z*g*(2*y-3*w+1+Math.sqrt(3)*(y-w)),T||(o.position.copy(n.getPosition(n.duration)),o.position.y=0,T=!0)}else a(),o.scale.y=p,o.scale.x=o.scale.z=p;o.scale.y=p*v,o.scale.x=o.scale.z=p/Math.sqrt(v)},promise:c}}let Se=null;function rt(){Se?.()}const lt=function(o){function e(n){if(!C)return;const c=C.camera,a=C.controls,s=c.getWorldDirection(new d).setY(0).normalize(),l=.3;c.position.addScaledVector(s,l*n/1e3),a.target.addScaledVector(s,l*n/1e3)}function t(){X(e)}function i(){U(e)}return o.addEventListener("pointerdown",t),o.addEventListener("pointerup",i),{destroy(){o.removeEventListener("pointerdown",t),o.removeEventListener("pointerup",i),U(e)}}},ct=function(o){function e(n){if(!C)return;const c=C.camera,a=C.controls,s=c.getWorldDirection(new d).setY(0).normalize(),l=-.3;c.position.addScaledVector(s,l*n/1e3),a.target.addScaledVector(s,l*n/1e3)}function t(){X(e)}function i(){U(e)}return o.addEventListener("pointerdown",t),o.addEventListener("pointerup",i),{destroy(){o.removeEventListener("pointerdown",t),o.removeEventListener("pointerup",i),U(e)}}};var dt=()=>history.back(),ut=Le('<div class="container svelte-1h15yrr"><canvas class="svelte-1h15yrr"></canvas> <button type="button" class="button left svelte-1h15yrr"><img alt="返回" draggable="false" class="svelte-1h15yrr"/> <span class="label svelte-1h15yrr">返回</span></button> <button type="button" class="button center-left svelte-1h15yrr"><img alt="前進" draggable="false" class="svelte-1h15yrr"/> <span class="label svelte-1h15yrr">前進</span></button> <button type="button" class="button center-right svelte-1h15yrr"><img alt="後退" draggable="false" class="svelte-1h15yrr"/> <span class="label svelte-1h15yrr">後退</span></button> <button type="button" class="button right svelte-1h15yrr"><img alt="重置" draggable="false" class="svelte-1h15yrr"/> <span class="label svelte-1h15yrr">重置</span></button></div>');function mt(o,e){Te(e,!1),tt(),ze();var t=ut(),i=V(k(t),2);i.__click=[dt];var n=k(i),c=V(i,2),a=k(c);J(c,r=>lt?.(r));var s=V(c,2),l=k(s);J(s,r=>ct?.(r));var u=V(s,2);u.__click=function(...r){rt?.apply(this,r)};var f=k(u);J(t,r=>it?.(r)),Pe(()=>{G(n,"src",W.chat.src),G(a,"src",W.chat.src),G(l,"src",W.chat.src),G(f,"src",W.chat.src)}),Ee(o,t),Ae()}Be(["click"]);export{mt as default};
