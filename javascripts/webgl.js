var canvas;
var gl;

var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var rotationX = 45.0;
var rotationY = 45.0;
var lastCubeUpdateTime = 0;
var numWave = 30;

var cubeImage;
var cubeTexture;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var vertexNormalAttribute;
var textureCoordAttribute;
var perspectiveMatrix;
var vertices;
var vertexNormals;

//
// start
//
// Called when the canvas is created to get the ball rolling.
//
function start() {
  canvas = document.getElementById("glcanvas");
  canvas.onmousedown = mouseDownListner;
  canvas.onmousemove = mouseMoveListner;
  canvas.onmouseup = mouseUpListner;

  window.addEventListener('keydown',doKeyDown,true)
 
  initWebGL(canvas);      // Initialize the GL context
  
  // Only continue if WebGL is available and working
  
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    
    initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    initVertexBuffers();    
    initBuffers();
    
    // Next, load and set up the textures we'll be using.
    
    initTextures();
    
    // Set up to draw the scene periodically.
    
    setInterval(drawScene, 15);
  }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;
  initWave();
  
  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }
  
  // If we don't have a GL context, give up now
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}


function doKeyDown(evt){
// alert(evt.keyCode);
 if(evt.keyCode == 38) {
  rotationX++;
 }
 if(evt.keyCode == 40) {
  rotationX--;
 }
 if(evt.keyCode == 37) {
  rotationY++;
 }
 if(evt.keyCode == 39) {
  rotationY--;
 }
 if(evt.keyCode == 32) {
  drop();
 }
 if(evt.keyCode == 67) {
  initWave();
 }
}
///////////////////////////////
//マウスクリック
///////////////////////////////
var clickFlag=0;
var g_downX=0;
var g_downY=0;
var g_downRotX=0;
var g_downRotY=0;

function mouseDownListner(e) {
 var rect = e.target.getBoundingClientRect();
 g_downX=e.clientX-rect.left;
 g_downY=e.clientY-rect.top;
 g_downRotX=rotationX;
 g_downRotY=rotationY;
 clickFlag = 1;
}
function mouseMoveListner(e) {
 if(clickFlag==0){
  return;
 }

 var rect = e.target.getBoundingClientRect();
 var mouseX=e.clientX-rect.left;
 var mouseY=e.clientY-rect.top;

 rotationX = g_downRotX-((g_downY - mouseY)/2);
 rotationY = g_downRotY-((g_downX - mouseX)/2);

}
function mouseUpListner(e) {
 clickFlag = 0;
}
//
//drop
//
function drop(x,y) {
 var x = numWave/2;
 var y = numWave/2;

 g_vp[x][y][1]+=1.0;

 g_vp[x-1][y][1]+=0.4;
 g_vp[x+1][y][1]+=0.4;
 g_vp[x][y-1][1]+=0.4;
 g_vp[x][y+1][1]+=0.4;

 g_vp[x-1][y-1][1]+=0.2;
 g_vp[x-1][y+1][1]+=0.2;
 g_vp[x+1][y-1][1]+=0.2;
 g_vp[x+1][y+1][1]+=0.2;


}

var g_pos=new Array();
var g_vp=new Array();
var g_vc=new Array();
//
//init
//
function initWave(){
 for(var x=0;x<numWave+1;x++){
  g_pos[x]=new Array();
  g_vp[x]=new Array();
  g_vc[x]=new Array();
  for(var z=0;z<numWave+1;z++){
    g_pos[x][z]=[x,0,z];
    g_vp[x][z]=[0,0,0];
    g_vc[x][z]=[0,1.0,0];
  }
 }
}
//
// calcWave
//
function calcWave() {
 var dis = 0;
 var vecdp = [0,0,0];

 for (var x=1;x<numWave-1;x++) {
  for (var y=1;y<numWave-1;y++) {
   var vecf = [0,0,0];

   vecdp = subVector3( g_pos[x][y], g_pos[x+1][y]);
   dis = 1.0 - absVector3(vecdp);
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;

   vecdp = subVector3( g_pos[x][y], g_pos[x-1][y]);
   dis = 1.0 - absVector3(vecdp);
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;
   vecdp = subVector3( g_pos[x][y], g_pos[x][y+1]);
   dis = 1.0 - absVector3(vecdp);
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;

   vecdp = subVector3( g_pos[x][y], g_pos[x][y-1]);
   dis = 1.0 - absVector3(vecdp);
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;

   vecdp = subVector3( g_pos[x][y], g_pos[x-1][y-1]);
   dis = (Math.sqrt(2.0) - absVector3(vecdp))*0.6;
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;
   vecdp = subVector3( g_pos[x][y], g_pos[x+1][y+1]);
   dis = (Math.sqrt(2.0) - absVector3(vecdp))*0.6;
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;
   vecdp = subVector3( g_pos[x][y], g_pos[x-1][y+1]);
   dis = (Math.sqrt(2.0) - absVector3(vecdp))*0.6;
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;
   vecdp = subVector3( g_pos[x][y], g_pos[x+1][y-1]);
   dis = (Math.sqrt(2.0) - absVector3(vecdp))*0.6;
   vecdp = nomalVector3(vecdp);
   vecf[0] += vecdp[0] * dis;
   vecf[1] += vecdp[1] * dis;
   vecf[2] += vecdp[2] * dis;


   // 加速
   g_vp[x][y][0] += vecf[0];
   g_vp[x][y][1] += vecf[1];
   g_vp[x][y][2] += vecf[2];
  }
 }
 for (var x=0;x<numWave;x++) {
  for (var y=0;y<numWave;y++) {
   g_pos[x][y][0] += g_vp[x][y][0]*0.1;
   g_pos[x][y][1] += g_vp[x][y][1]*0.1;
   g_pos[x][y][2] += g_vp[x][y][2]*0.1;   
  }
 }
 //法線求める
 for (var x=1;x<numWave-1;x++) {
  for (var y=1;y<numWave-1;y++) {
   var plane1 = crossVector3(subVector3( g_pos[x][y], g_pos[x][y-1]),subVector3( g_pos[x][y], g_pos[x-1][y]));
   var plane2 = crossVector3(subVector3( g_pos[x][y], g_pos[x-1][y]),subVector3( g_pos[x][y], g_pos[x][y+1]));
   var plane3 = crossVector3(subVector3( g_pos[x][y], g_pos[x+1][y]),subVector3( g_pos[x][y], g_pos[x][y-1]));
   var plane4 = crossVector3(subVector3( g_pos[x][y], g_pos[x][y+1]),subVector3( g_pos[x][y], g_pos[x+1][y]));

   g_vc[x][y][0] = plane1[0]+plane2[0]+plane3[0]+plane4[0];
   g_vc[x][y][1] = plane1[1]+plane2[1]+plane3[1]+plane4[1];
   g_vc[x][y][2] = plane1[2]+plane2[2]+plane3[2]+plane4[2];
   if(g_vc[x][y][0]==0 && g_vc[x][y][1]==0 && g_vc[x][y][2]==0){
    g_vc[x][y][1]= 1.0;
    continue;
   }
   g_vc[x][y] = nomalVector3(g_vc[x][y]);
  }
 }



//  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
//  vertices = new Array();
  for(var x=0;x<numWave * numWave;x++){
    var index = x * 12;
    var posX = Math.floor(x%numWave);
    var posY = Math.floor(x/numWave);

    vertices[index + 0] = (-numWave/2) + g_pos[posX][posY][0];
    vertices[index + 1] = g_pos[posX][posY][1];
    vertices[index + 2] = (-numWave/2) + g_pos[posX][posY][2];

    vertices[index + 3] = (-numWave/2) + g_pos[posX][posY+1][0];
    vertices[index + 4] = g_pos[posX][posY+1][1];
    vertices[index + 5] = (-numWave/2) + g_pos[posX][posY+1][2];

    vertices[index + 6] = (-numWave/2) + g_pos[posX+1][posY+1][0];
    vertices[index + 7] = g_pos[posX+1][posY+1][1];
    vertices[index + 8] = (-numWave/2) + g_pos[posX+1][posY+1][2];

    vertices[index + 9] = (-numWave/2) + g_pos[posX+1][posY][0];
    vertices[index +10] = g_pos[posX+1][posY][1];
    vertices[index +11] = (-numWave/2) + g_pos[posX+1][posY][2];
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

//  verticesNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesNormalBuffer);
//  vertexNormals = new Array();
  for(var x=0;x<numWave * numWave;x++){
    var index = x * 12;
    var posX = Math.floor(x%numWave);
    var posY = Math.floor(x/numWave);
    
    vertexNormals[index + 0] = g_vc[posX][posY][0];
    vertexNormals[index + 1] = g_vc[posX][posY][1];
    vertexNormals[index + 2] = g_vc[posX][posY][2];

    vertexNormals[index + 3] = g_vc[posX][posY+1][0];
    vertexNormals[index + 4] = g_vc[posX][posY+1][1];
    vertexNormals[index + 5] = g_vc[posX][posY+1][2];

    vertexNormals[index + 6] = g_vc[posX+1][posY+1][0];
    vertexNormals[index + 7] = g_vc[posX+1][posY+1][1];
    vertexNormals[index + 8] = g_vc[posX+1][posY+1][2];

    vertexNormals[index + 9] = g_vc[posX+1][posY][0];
    vertexNormals[index +10] = g_vc[posX+1][posY][1];
    vertexNormals[index +11] = g_vc[posX+1][posY][2];
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
}
//
// initVertexBuffers
//
function initVertexBuffers(){
  verticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

  vertices = new Array();
  for(var x=0;x<numWave * numWave;x++){
    var index = x * 12;
    var posX = Math.floor(x%numWave);
    var posY = Math.floor(x/numWave);

    vertices[index + 0] = posX;
    vertices[index + 1] =  0.0;
    vertices[index + 2] = posY;

    vertices[index + 3] = posX;
    vertices[index + 4] =  0.0;
    vertices[index + 5] = posY+1.0;

    vertices[index + 6] = posX+1.0;
    vertices[index + 7] =  0.0;
    vertices[index + 8] = posY+1.0;

    vertices[index + 9] = posX+1.0;
    vertices[index +10] =  0.0;
    vertices[index +11] = posY;
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  verticesNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesNormalBuffer);
  vertexNormals = new Array();
  for(var x=0;x<numWave * numWave;x++){
    var index = x * 12;
    vertexNormals[index + 0]= 0.0;
    vertexNormals[index + 1]= 1.0;
    vertexNormals[index + 2]= 0.0;

    vertexNormals[index + 3]= 0.0;
    vertexNormals[index + 4]= 1.0;
    vertexNormals[index + 5]= 0.0;

    vertexNormals[index + 6]= 0.0;
    vertexNormals[index + 7]= 1.0;
    vertexNormals[index + 8]= 0.0;

    vertexNormals[index + 9]= 0.0;
    vertexNormals[index +10]= 1.0;
    vertexNormals[index +11]= 0.0;
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
}
//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional cube.
//
function initBuffers() {
  initVertexBuffers();
  
  // Map the texture onto the cube's faces.
  cubeVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);

  var textureCoordinates = new Array();
  for(var x=0;x<numWave * numWave;x++){
    var index = x * 8;
    var posX = Math.floor(x%numWave);
    var posY = Math.floor(x/numWave);
    var width = 1.0 / numWave

    textureCoordinates[index + 0]= (posX*width);
    textureCoordinates[index + 1]= (posY*width);

    textureCoordinates[index + 2]= (posX*width);
    textureCoordinates[index + 3]= (posY*width)+width;

    textureCoordinates[index + 4]= (posX*width)+width;
    textureCoordinates[index + 5]= (posY*width)+width;

    textureCoordinates[index + 6]= (posX*width)+width;
    textureCoordinates[index + 7]= (posY*width);
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  
  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  
  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  var cubeVertexIndices = new Array();
  for(var x=0;x<numWave*numWave;x++){
   var index = x * 6;
   cubeVertexIndices[index+0]=(x*4)+0;
   cubeVertexIndices[index+1]=(x*4)+1;
   cubeVertexIndices[index+2]=(x*4)+2;
   cubeVertexIndices[index+3]=(x*4)+0;
   cubeVertexIndices[index+4]=(x*4)+2;
   cubeVertexIndices[index+5]=(x*4)+3;
  }


  // Now send the element array to GL
  
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

//
// initTextures
//
// Initialize the textures we'll be using, then initiate a load of
// the texture images. The handleTextureLoaded() callback will finish
// the job; it gets called each time a texture finishes loading.
//
function initTextures() {
  cubeTexture = gl.createTexture();
  cubeImage = new Image();
  cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
  cubeImage.src = "images/water.png";
}

function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
//  initVertexBuffers();
  calcWave();
  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);
  
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  
  loadIdentity();
  
  // Now move the drawing position a bit to where we want to start
  // drawing the cube.
  
  mvTranslate([0.0, 0.0, -numWave*1.8]);
  
  // Save the current matrix, then rotate before we draw.
  
  mvPushMatrix();
  mvRotate(rotationX, [1, 0, 0]);
  mvRotate(rotationY, [0, 1, 0]);
  
  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Set the texture coordinates attribute for the vertices.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
  
  // Bind the normals buffer to the shader attribute.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesNormalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Specify the texture to map onto the faces.
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
  gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  
  // Draw the cube.
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, numWave*numWave*2*3, gl.UNSIGNED_SHORT, 0);
  
  // Restore the original matrix
  
  mvPopMatrix();
  
  // Update the rotation for the next draw, if it's time to do so.
  
  var currentTime = (new Date).getTime();
  if (lastCubeUpdateTime) {
    var delta = currentTime - lastCubeUpdateTime;
    
    //rotationX += (0 * delta) / 1000.0;
  }
  
  lastCubeUpdateTime = currentTime;
}

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
  var fragmentShader = getShader(gl, "shader-fs");
  var vertexShader = getShader(gl, "shader-vs");
  
  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  
  textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(textureCoordAttribute);
  
  vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
  
  var normalMatrix = mvMatrix.inverse();
  normalMatrix = normalMatrix.transpose();
  var nUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");
  gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}
//ベクトル引き算
function subVector3(vec1,vec2){
 var ret = new Array();
 ret[0] = vec1[0]-vec2[0];
 ret[1] = vec1[1]-vec2[1];
 ret[2] = vec1[2]-vec2[2];
 return ret;
}
//内積
function dotVector3(vec1,vec2){
 return (vec1[0] * vec2[0] +  vec1[1] * vec2[1] +  vec1[2] * vec2[2]);
}
//外積
function crossVector3(vec1,vec2){
 var ret = new Array();
 ret[0] = (vec1[1]*vec2[2])-(vec1[2]*vec2[1]);
 ret[1] = (vec1[2]*vec2[0])-(vec1[0]*vec2[2]);
 ret[2] = (vec1[0]*vec2[1])-(vec1[1]*vec2[0]);
 return ret;
}
//正規化
function nomalVector3(vec){
 var ret = new Array();
 var length = 1.0 / absVector3(vec);
 ret[0] = vec[0] * length;
 ret[1] = vec[1] * length;
 ret[2] = vec[2] * length;
 return ret;
}
//ベクトル長
function absVector3(vec){
 return Math.sqrt((vec[0] * vec[0]) + (vec[1] * vec[1]) + (vec[2] * vec[2]));
}

