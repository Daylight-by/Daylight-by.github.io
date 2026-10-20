(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,64115,e=>{"use strict";e.s(["createFluidSim",0,function(e,t={}){let r,i,o,a,n,u=t.backColor??{r:.04,g:.04,b:.06},l=!1!==t.autoSplats,f={alpha:!1,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1},v=e.getContext("webgl2",f)||e.getContext("webgl",f);if(!v)return null;let c="u">typeof WebGL2RenderingContext&&v instanceof WebGL2RenderingContext,m=null,s=!1;c?(v.getExtension("EXT_color_buffer_float"),s=!!v.getExtension("OES_texture_float_linear")):(m=v.getExtension("OES_texture_half_float"),s=!!v.getExtension("OES_texture_half_float_linear"));let d=c?v.HALF_FLOAT:m?m.HALF_FLOAT_OES:v.UNSIGNED_BYTE;function x(e,t,r){let i,o;if(i=v.createTexture(),v.bindTexture(v.TEXTURE_2D,i),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MIN_FILTER,v.NEAREST),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MAG_FILTER,v.NEAREST),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_S,v.CLAMP_TO_EDGE),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_T,v.CLAMP_TO_EDGE),v.texImage2D(v.TEXTURE_2D,0,e,4,4,0,t,r,null),o=v.createFramebuffer(),v.bindFramebuffer(v.FRAMEBUFFER,o),v.framebufferTexture2D(v.FRAMEBUFFER,v.COLOR_ATTACHMENT0,v.TEXTURE_2D,i,0),v.checkFramebufferStatus(v.FRAMEBUFFER)===v.FRAMEBUFFER_COMPLETE)return{internalFormat:e,format:t};if(!c)return null;switch(e){case v.R16F:return x(v.RG16F,v.RG,r);case v.RG16F:return x(v.RGBA16F,v.RGBA,r);default:return null}}let h=null;if(c){let e=x(v.RGBA16F,v.RGBA,d),t=x(v.RG16F,v.RG,d),r=x(v.R16F,v.RED,d);if(!e||!t||!r)return null;h={formatRGBA:e,formatRG:t,formatR:r,halfFloatTexType:d,supportLinearFiltering:s}}else{let e=x(v.RGBA,v.RGBA,d);if(!e)return null;h={formatRGBA:e,formatRG:e,formatR:e,halfFloatTexType:d,supportLinearFiltering:s}}let g=s?1024:512,T=128;function p(e,t,r){let i=t;r&&r.length&&(i=r.map(e=>`#define ${e}
`).join("")+t);let o=v.createShader(e);return v.shaderSource(o,i),v.compileShader(o),v.getShaderParameter(o,v.COMPILE_STATUS)||console.warn("[fluid] shader error:",v.getShaderInfoLog(o)),o}class R{program;uniforms;constructor(e,t){this.program=function(e,t){let r=v.createProgram();return v.attachShader(r,e),v.attachShader(r,t),v.bindAttribLocation(r,0,"aPosition"),v.linkProgram(r),v.getProgramParameter(r,v.LINK_STATUS)||console.warn("[fluid] program link error:",v.getProgramInfoLog(r)),r}(E,p(v.FRAGMENT_SHADER,e,t)),this.uniforms=function(e){let t={},r=v.getProgramParameter(e,v.ACTIVE_UNIFORMS);for(let i=0;i<r;i++){let r=v.getActiveUniform(e,i);if(!r)continue;let o=v.getUniformLocation(e,r.name);o&&(t[r.name]=o)}return t}(this.program)}bind(){v.useProgram(this.program)}}let E=p(v.VERTEX_SHADER,`
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `),y=`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture2D(uTarget, vUv).xyz;
      gl_FragColor = vec4(base + splat, 1.0);
    }
  `,D=`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 fuv = fract(st);
      vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
      #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
      #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
      #endif
      float decay = 1.0 + dissipation * dt;
      gl_FragColor = result / decay;
    }
  `,S=`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).x;
      float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y;
      float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `,_=`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uVelocity, vL).y;
      float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x;
      float B = texture2D(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `,F=`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture2D(uCurl, vL).x;
      float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x;
      float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity += force * dt;
      velocity = min(max(velocity, -1000.0), 1000.0);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,A=`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      float divergence = texture2D(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `,b=`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture2D(uPressure, vL).x;
      float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x;
      float B = texture2D(uPressure, vB).x;
      vec2 velocity = texture2D(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `,U=`
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
      gl_FragColor = value * texture2D(uTexture, vUv);
    }
  `,w=new R(`
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;
    void main () {
      vec3 c = texture2D(uTexture, vUv).rgb;
      #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
      #endif
      gl_FragColor = vec4(c, 1.0);
    }
  `,["SHADING"]),L=new R(y),B=new R(D,s?void 0:["MANUAL_FILTERING"]),X=new R(S),z=new R(_),P=new R(F),C=new R(A),M=new R(b),G=new R(U);function Y(e){null==e?(v.viewport(0,0,v.drawingBufferWidth,v.drawingBufferHeight),v.bindFramebuffer(v.FRAMEBUFFER,null)):(v.viewport(0,0,e.width,e.height),v.bindFramebuffer(v.FRAMEBUFFER,e.fbo)),v.drawElements(v.TRIANGLES,6,v.UNSIGNED_SHORT,0)}function N(e,t,r,i,o,a){v.activeTexture(v.TEXTURE0);let n=v.createTexture();v.bindTexture(v.TEXTURE_2D,n),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MIN_FILTER,a),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MAG_FILTER,a),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_S,v.CLAMP_TO_EDGE),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_T,v.CLAMP_TO_EDGE),v.texImage2D(v.TEXTURE_2D,0,r,e,t,0,i,o,null);let l=v.createFramebuffer();return v.bindFramebuffer(v.FRAMEBUFFER,l),v.framebufferTexture2D(v.FRAMEBUFFER,v.COLOR_ATTACHMENT0,v.TEXTURE_2D,n,0),v.viewport(0,0,e,t),v.clearColor(u.r,u.g,u.b,1),v.clear(v.COLOR_BUFFER_BIT),{texture:n,fbo:l,width:e,height:t,texelSizeX:1/e,texelSizeY:1/t,attach:e=>(v.activeTexture(v.TEXTURE0+e),v.bindTexture(v.TEXTURE_2D,n),e)}}function I(e,t,r,i,o,a){let n=N(e,t,r,i,o,a),u=N(e,t,r,i,o,a);return{width:e,height:t,texelSizeX:n.texelSizeX,texelSizeY:n.texelSizeY,read:n,write:u,swap(){let e=this.read;this.read=this.write,this.write=e}}}function V(e){v.deleteTexture(e.texture),v.deleteFramebuffer(e.fbo)}function O(e){V(e.read),V(e.write)}function H(e){let t=v.drawingBufferWidth/v.drawingBufferHeight;t<1&&(t=1/t);let r=Math.round(e),i=Math.round(e*t);return v.drawingBufferWidth>v.drawingBufferHeight?{width:i,height:r}:{width:r,height:i}}function W(){r&&O(r),i&&O(i),o&&V(o),a&&V(a),n&&O(n);let e=H(T),t=H(g);r=I(t.width,t.height,h.formatRGBA.internalFormat,h.formatRGBA.format,h.halfFloatTexType,k),i=I(e.width,e.height,h.formatRG.internalFormat,h.formatRG.format,h.halfFloatTexType,k),o=N(e.width,e.height,h.formatR.internalFormat,h.formatR.format,h.halfFloatTexType,v.NEAREST),a=N(e.width,e.height,h.formatR.internalFormat,h.formatR.format,h.halfFloatTexType,v.NEAREST),n=I(e.width,e.height,h.formatR.internalFormat,h.formatR.format,h.halfFloatTexType,v.NEAREST)}v.bindBuffer(v.ARRAY_BUFFER,v.createBuffer()),v.bufferData(v.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),v.STATIC_DRAW),v.bindBuffer(v.ELEMENT_ARRAY_BUFFER,v.createBuffer()),v.bufferData(v.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),v.STATIC_DRAW),v.vertexAttribPointer(0,2,v.FLOAT,!1,0,0),v.enableVertexAttribArray(0);let k=s?v.LINEAR:v.NEAREST,K=[{id:-1,texcoordX:0,texcoordY:0,prevTexcoordX:0,prevTexcoordY:0,deltaX:0,deltaY:0,down:!1,moved:!1,color:{r:.15,g:0,b:.3}}],j=[],q=0;function $(){let e=function(e){let t=0,r=0,i=0,o=Math.floor(6*e),a=6*e-o,n=+(1-a),u=+(1-(1-a)*1);switch(o%6){case 0:t=1,r=u,i=0;break;case 1:t=n,r=1,i=0;break;case 2:t=0,r=1,i=u;break;case 3:t=0,r=n,i=1;break;case 4:t=u,r=0,i=1;break;case 5:t=1,r=0,i=n}return{r:t,g:r,b:i}}(Math.random());return e.r*=.15,e.g*=.15,e.b*=.15,e}function J(e){for(let t=0;t<e;t++){let e=$();e.r*=10,e.g*=10,e.b*=10,Q(Math.random(),Math.random(),1e3*(Math.random()-.5),1e3*(Math.random()-.5),e)}}function Q(t,o,a,n,u){var l;let f;L.bind(),v.uniform1i(L.uniforms.uTarget,i.read.attach(0)),v.uniform1f(L.uniforms.aspectRatio,e.width/e.height),v.uniform2f(L.uniforms.point,t,o),v.uniform3f(L.uniforms.color,a,n,0),v.uniform1f(L.uniforms.radius,(l=.0022,(f=e.width/e.height)>1&&(l*=f),l)),Y(i.write),i.swap(),v.uniform1i(L.uniforms.uTarget,r.read.attach(0)),v.uniform3f(L.uniforms.color,u.r,u.g,u.b),Y(r.write),r.swap()}let Z=performance.now(),ee=0,et=!1,er=0;function ei(e){return Math.floor(e*Math.min(window.devicePixelRatio||1,2))}function eo(){let t=ei(e.clientWidth),r=ei(e.clientHeight);return 0!==t&&0!==r&&(e.width!==t||e.height!==r)&&(e.width=t,e.height=r,!0)}function ea(t,r,i,o){t.id=r,t.down=!0,t.moved=!1,t.texcoordX=i/e.width,t.texcoordY=1-o/e.height,t.prevTexcoordX=t.texcoordX,t.prevTexcoordY=t.texcoordY,t.deltaX=0,t.deltaY=0,t.color=$()}function en(e){ea(K[0],-1,ei(e.clientX),ei(e.clientY))}function eu(t){var r,i;let o,a,n=K[0],u=ei(t.clientX),l=ei(t.clientY);n.down?(n.prevTexcoordX=n.texcoordX,n.prevTexcoordY=n.texcoordY,n.texcoordX=u/e.width,n.texcoordY=1-l/e.height,r=n.texcoordX-n.prevTexcoordX,(o=e.width/e.height)<1&&(r*=o),n.deltaX=r,i=n.texcoordY-n.prevTexcoordY,(a=e.width/e.height)>1&&(i/=a),n.deltaY=i,n.moved=Math.abs(n.deltaX)>0||Math.abs(n.deltaY)>0):ea(n,-1,u,l)}function el(){K[0].down=!1}return e.addEventListener("pointerdown",en),e.addEventListener("pointermove",eu),e.addEventListener("pointerup",el),e.addEventListener("pointerleave",el),et||(et=!0,Z=performance.now(),eo(),W(),J(Math.floor(12*Math.random())+6),ee=requestAnimationFrame(function e(t){if(!et)return;let u=Math.min((t-Z)/1e3,.066);Z=t,eo()&&W(),(q+=8*u)>=1&&(q%=1,K.forEach(e=>{e.color=$()})),l&&(er+=u)>1.6&&(er=0,J(1+Math.floor(2*Math.random()))),j.length>0&&J(j.pop()),K.forEach(e=>{if(e.moved){let t,r;e.moved=!1,t=6e3*e.deltaX,r=6e3*e.deltaY,Q(e.texcoordX,e.texcoordY,t,r,e.color)}}),v.disable(v.BLEND),z.bind(),v.uniform2f(z.uniforms.texelSize,i.texelSizeX,i.texelSizeY),v.uniform1i(z.uniforms.uVelocity,i.read.attach(0)),Y(a),P.bind(),v.uniform2f(P.uniforms.texelSize,i.texelSizeX,i.texelSizeY),v.uniform1i(P.uniforms.uVelocity,i.read.attach(0)),v.uniform1i(P.uniforms.uCurl,a.attach(1)),v.uniform1f(P.uniforms.curl,28),v.uniform1f(P.uniforms.dt,u),Y(i.write),i.swap(),X.bind(),v.uniform2f(X.uniforms.texelSize,i.texelSizeX,i.texelSizeY),v.uniform1i(X.uniforms.uVelocity,i.read.attach(0)),Y(o),G.bind(),v.uniform1i(G.uniforms.uTexture,n.read.attach(0)),v.uniform1f(G.uniforms.value,.8),Y(n.write),n.swap(),C.bind(),v.uniform2f(C.uniforms.texelSize,i.texelSizeX,i.texelSizeY),v.uniform1i(C.uniforms.uDivergence,o.attach(0));for(let e=0;e<20;e++)v.uniform1i(C.uniforms.uPressure,n.read.attach(1)),Y(n.write),n.swap();M.bind(),v.uniform2f(M.uniforms.texelSize,i.texelSizeX,i.texelSizeY),v.uniform1i(M.uniforms.uPressure,n.read.attach(0)),v.uniform1i(M.uniforms.uVelocity,i.read.attach(1)),Y(i.write),i.swap(),B.bind(),v.uniform2f(B.uniforms.texelSize,i.texelSizeX,i.texelSizeY),s||v.uniform2f(B.uniforms.dyeTexelSize,i.texelSizeX,i.texelSizeY);let f=i.read.attach(0);v.uniform1i(B.uniforms.uVelocity,f),v.uniform1i(B.uniforms.uSource,f),v.uniform1f(B.uniforms.dt,u),v.uniform1f(B.uniforms.dissipation,.25),Y(i.write),i.swap(),s||v.uniform2f(B.uniforms.dyeTexelSize,r.texelSizeX,r.texelSizeY),v.uniform1i(B.uniforms.uVelocity,i.read.attach(0)),v.uniform1i(B.uniforms.uSource,r.read.attach(1)),v.uniform1f(B.uniforms.dissipation,1),Y(r.write),r.swap(),w.bind(),v.uniform2f(w.uniforms.texelSize,r.texelSizeX,r.texelSizeY),v.uniform1i(w.uniforms.uTexture,r.read.attach(0)),Y(null),ee=requestAnimationFrame(e)})),{destroy:function(){et=!1,ee&&cancelAnimationFrame(ee),ee=0,e.removeEventListener("pointerdown",en),e.removeEventListener("pointermove",eu),e.removeEventListener("pointerup",el),e.removeEventListener("pointerleave",el);let t=v.getExtension("WEBGL_lose_context");t&&t.loseContext()},pushSplats:e=>j.push(e)}}])}]);