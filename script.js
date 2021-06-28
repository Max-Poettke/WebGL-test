"use strict";

const canvas = document.createElement("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext ("webgl2");

gl.clearColor(0, 0, 0, 1);

const program = createProgram ([`#version 300 es
in vec2 a_position;

uniform float time;

out vec4 v_color;

vec2 position;

void main(){
  position = vec2(
    cos(time / 200.0) * a_position.x +
    sin(time / 200.0) * a_position.y,
    cos(time / 200.0) * a_position.y -
    sin(time / 200.0) * a_position.x
  );
  gl_Position = vec4(position, 0, 1);
  v_color = vec4(
     cos(time / 1200.0) * 0.5 + 0.5,
     sin(time / 1200.0) * 0.5 + 0.5,
    -cos(time / 1200.0) * 0.5 + 0.5,
     1
  );
}
`, `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 color;

void main(){
  color = v_color;
}
`]);

gl.useProgram (program);

const POSITION = 0;
const TIME = gl.getUniformLocation(program, "time");

gl.enableVertexAttribArray (POSITION);

const positionBuffer = gl.createBuffer();
gl.bindBuffer (gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData (gl.ARRAY_BUFFER, new Float32Array([
  -0.5, -0.5,
   0.5, -0.5,
  -0.5,  0.5,

   0.5, -0.5,
   0.5,  0.5,
  -0.5,  0.5
]), gl.STATIC_DRAW);

var data = {
  position: POSITION,
  size: 2,
  type: gl.FLOAT,
  normalize: false,
  stride: 0,
  offset: 0
};

gl.vertexAttribPointer (data.position, data.size, data.type, data.normalize, data.stride, data.offset);

window.addEventListener ("load", function () {
  document.body.appendChild (canvas);
  update(performance.now());
}, {once: true});

window.addEventListener ("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport (0, 0, canvas.width, canvas.height);

  draw ();
});

function update (time){
  gl.uniform1f(TIME, time);
  draw();
  requestAnimationFrame(update);
}

function draw (){
  gl.clear (gl.COLOR_BUFFER_BIT)

  var data = {
    type: gl.TRIANGLES,
    offset: 0,
    count: 6
  };

  gl.drawArrays (data.type, data.offset, data.count);
}

function createProgram (shaders) {
  const program = gl.createProgram ();

  [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach (function (type, i) {
    const shader = gl.createShader (type);
    gl.shaderSource (shader, shaders[i]);
    gl.compileShader (shader);

    if (gl.getShaderParameter (shader, gl.COMPILE_STATUS)) {
      gl.attachShader (program, shader);
      return;
    }

    console.warn (gl.getShaderInfoLog (shader));
    gl.deleteShader (shader);
  });

  gl.linkProgram (program);

  if (gl.getProgramParameter (program, gl.LINK_STATUS)) {
    return program;
  }

  console.warn (gl.getProgramInfoLog (program));
  gl.deleteProgram (program);
}
