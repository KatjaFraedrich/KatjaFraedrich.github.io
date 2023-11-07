import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from './js/three.module.js'//'https://unpkg.com/three@0.127.0/build/three.module.js';
//import Stats from './js/stats.min.js';
import { GUI } from 'https://unpkg.com/three@0.127.0/examples/jsm/libs/dat.gui.module.js';
import { DragControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';
import { NRRDLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/NRRDLoader.js';
import { VolumeRenderShader1 } from './volumeShader.js'//'https://unpkg.com/three@0.127.0/examples/jsm/shaders/VolumeShader.js';
//import { debug } from 'webpack';
//import { debug } from 'webpack';
//import WebGL from 'three/addons/capabilities/WebGL.js';

/*if ( WebGL.isWebGL2Available() === false ) {

    document.body.appendChild( WebGL.getWebGL2ErrorMessage() );

}*/

let responseDir= await fetch(
    'http://127.0.0.1:5000/direction10K',
    {
       method: 'GET',
       
 });

let response = await fetch(
    'http://127.0.0.1:5000/density10K',
    {
       method: 'GET',
       
 });
 console.log(response);


let responseTraj = await fetch(
    'http://127.0.0.1:5000/traj10K',
    {
       method: 'GET',
       
 });
/*
 let responseDir= await fetch(
    'http://127.0.0.1:5000/direction10K',
    {
       method: 'GET',
       
 });

 console.log(responseTraj);
*/

const stats = new Stats()
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0';
stats.domElement.style.top = '0';
document.body.appendChild( stats.domElement );



const overviewScene= new THREE.Scene()
overviewScene.background=new THREE.Color().setRGB( 0, 0, 0, THREE.SRGBColorSpace )

const sliceScene= new THREE.Scene()
sliceScene.background=new THREE.Color().setRGB( 0, 0, 0, THREE.SRGBColorSpace )

const renderer=new THREE.WebGLRenderer()

const h = 512; // frustum height
const aspect = window.innerWidth / window.innerHeight;

const cameraOverview=new THREE.OrthographicCamera( - h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 1, 2000 );// new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
cameraOverview.position.fromArray( [ 200,200, 40 ] );
//cameraOverview.applyQuaternion(0.697,0.0145,0.0149,0.716)
cameraOverview.lookAt(50,50,50)
cameraOverview.up.fromArray( [0, 0, 1 ] );
cameraOverview.updateProjectionMatrix()
//cameraOverview.zoom=10



const cameraSlice=new THREE.OrthographicCamera( - h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 0, 1000 );// new THREE.PerspectiveCamera( view.fov, window.innerWidth / window.innerHeight, 1, 10000 );
cameraSlice.position.set( 50,50, 500);
cameraSlice.up.fromArray( [0, 0, 1] );
cameraSlice.zoom=2
cameraSlice.updateProjectionMatrix()

const axesHelper1 = new THREE.AxesHelper(5)
overviewScene.add(axesHelper1)
const axesHelper2 = new THREE.AxesHelper(5)
sliceScene.add(axesHelper2)


// let renderer,
//     scene,
//     camera,
var controls
var controlsSlice
var  material 
var frame=30
var materialSlice
var sliceThickness=1
var  volconfig;
var  cmtextures;
var sliderMesh; 
var particles;
var points;
var arraySlice;
var colors;
var colorsIndividual;
var opacitys;
var typedDensityArray
var pointCloudSlice;
var dataArray=[]
var texture;
var textureSlice; 
var pointCloudGeometry = new THREE.BufferGeometry(); 
var vertices ;
var densityVolume;
var denistySlice;
var frameIndicesPoints=[];
var volumeShader;
var customPointShader
var pointCloudMat

var directionTexture
var typedDirectionArray

var lineSegments
var bufferLineGeometry
var lineColorsDir
var lineColorsInd

const xLength=100;
const yLength=100;
const zLength=96;//929;



function init() {


    

    const light = new THREE.DirectionalLight( 0xffffff, 3 );
    light.position.set( 0, 0, 1 );
    // overviewScene.add( light );
    // sliceScene.add( light );
    // Create renderer
    
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    
    
    
    var divLeft = document.createElement("div");
    divLeft.style.width = "50%";
    divLeft.style.float= "left"
    divLeft.style.height = "100%"//"100px";
    divLeft.style.position="absolute"
    divLeft.style.top="0"
    //divLeft.style.background = "red";
    document.body.appendChild(divLeft);

    var divRight = document.createElement("div");
    divRight.style.width = "50%";
    divRight.style.float= "right"
    divRight.style.height = "100%"//"100px";
    divRight.style.position="absolute"
    //divRight.style.background = "blue";
    divRight.style.top="0"
    divRight.style.left="50%"
    document.body.appendChild(divRight);
    
    
    // Create controls
    controls = new OrbitControls( cameraOverview,divLeft  );//renderer.domElement
    controls.addEventListener( 'change', OnCameraChange );
    controls.target.set(50,50,50)
    controls.position0.set(470,-800,70)
    
    //controls.target.set( 64, 64, 128 );
    //controls.minZoom = 0.5;
    //controls.maxZoom = 4;
    //controls.enablePan = false;
    controls.update();

    controlsSlice = new OrbitControls( cameraSlice,divRight  );//renderer.domElement
    controlsSlice.addEventListener( 'change', OnCameraChange );
    controlsSlice.target.set(50,50,50)
    controlsSlice.enableRotate=false;
    //controlsSlice.minPolarAngle = Math.PI/2;
    //controlsSlice.maxPolarAngle = Math.PI/2;
    //controlsSlice.position0.set(0,-800,0)
    //controlsSlice.target.set(0,0,0)
    //controlsSlice.position0.set(0,-800,70)
    controlsSlice.update();

    

    // The gui for interaction
    volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis',showSlider:false,showPoints:true,pointColorMode:'direction',showLines:true,lineColorMode:'direction',sliceThickness: 1,showVolume:true,volumeColorMode:'density' };
    const gui = new GUI();
    gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
    gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
    
    gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
    gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );
    gui.add( volconfig, 'showSlider').onChange( updateUniforms );
    gui.add( volconfig, 'sliceThickness', 1, 100, 1).onChange( updateUniforms );
    gui.add( volconfig, 'showPoints').onChange( updateUniforms );
    gui.add( volconfig, 'pointColorMode', { individual: 'individual', direction: 'direction' } ).onChange( updateUniforms );
    gui.add( volconfig, 'showLines').onChange( updateUniforms );
    gui.add( volconfig, 'lineColorMode', { individual: 'individual', direction: 'direction' } ).onChange( updateUniforms );
    
    gui.add( volconfig, 'showVolume').onChange( updateUniforms );
    gui.add( volconfig, 'volumeColorMode', { density: 'density', direction: 'direction' } ).onChange( updateUniforms );
    gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis',rainbow:'rainbow' } ).onChange( updateUniforms );

    // Load the data ...
    //new NRRDLoader().load( 'stent.nrrd', function ( volume ) {
    
    responseDir.text().then(function (text) {
        //console.log(text.length)

        

        const dataDirectionArray=text.replace('[','').replace(']','').split(",").map(Number);
        //console.log(dataDensityArray)
        typedDirectionArray=new Float32Array(dataDirectionArray)
        
        directionTexture = new THREE.Data3DTexture( typedDirectionArray, xLength, yLength, zLength);
        
        
        directionTexture.format = THREE.RedFormat;
        directionTexture.type = THREE.FloatType;
        directionTexture.minFilter = directionTexture.magFilter = THREE.LinearFilter;
        directionTexture.unpackAlignment = 1;
        directionTexture.needsUpdate = true;
    });
   
   
   
    //load in the data for the individual trajectories
    responseTraj.text().then(function (text) {
        //console.log(text.length)
        // text=text.subtring(1)
        //text=text.slice(1,-1)
        var tempVertices=[]
        var stringArray=JSON.parse("[" +text+"]")
        var tempColors=[]
        var tempOpacitys=[]
        var tempColorsIndividual=[]
        var linePoints=[]
        lineColorsInd=[]
        lineColorsDir=[]
        var lineIndicesTest=[]

        for(var i=0;i<stringArray[0].length;i++ ){
            dataArray.push([])
            frameIndicesPoints.push(tempVertices.length)
            for(var j=0;j<stringArray[0][i][1].length;j++){
                dataArray[i].push(stringArray[0][i][1][j].replace('[','').replace(']','').split(",").map(Number))
                var vertex= new THREE.Vector3();
                vertex.x=(dataArray[i][j][0]/7000)*xLength
                vertex.y=(dataArray[i][j][1]/7000)*yLength
                vertex.z=i
                tempVertices.push(vertex.x)
                tempVertices.push(vertex.y)
                tempVertices.push(vertex.z)
                tempColorsIndividual.push(dataArray[i][j][4],dataArray[i][j][5],dataArray[i][j][6])

                var trajId=dataArray[i][j][7]
                //console.log(trajId)
                if(linePoints.length-1<trajId){
                    linePoints.push([])
                    lineColorsInd.push([])
                    lineColorsDir.push([])
                }
                //console.log(trajId)
                //console.log(linePoints.length)
                linePoints[trajId].push(vertex.x,vertex.y,vertex.z)
                lineColorsInd[trajId].push(dataArray[i][j][4],dataArray[i][j][5],dataArray[i][j][6])
                //calculate colors based on movement direction
                if(i>0){
                    
                    var prevIndex=dataArray[i][j][2]
                    //console.log(prevIndex,i,j,dataArray[i-1].length)
                    if(prevIndex!=-1 && prevIndex<dataArray[i-1].length){
                        var prevVertex=new THREE.Vector3((dataArray[i-1][prevIndex][0]/7000)*xLength,(dataArray[i-1][prevIndex][1]/7000)*yLength,i);
                       //console.log(dataArray[i][j])
                        //var color=new THREE.Vector3(Math.abs(vertex.x-prevVertex.x),Math.abs(vertex.y-prevVertex.y),0 )
                        //tempColors.push(color.x/(color.x+color.y),color.y/(color.x+color.y),0)
                        var color=new THREE.Vector3(vertex.x-prevVertex.x,vertex.y-prevVertex.y,0 )
                        var length=Math.sqrt(color.x*color.x+color.y*color.y)
                        
                        var newColor=mapDirectionToColor(color.x,color.y)

                        tempOpacitys.push(length)
                        tempColors.push(newColor[0],newColor[1],newColor[2])
                        lineColorsDir[trajId].push(newColor[0],newColor[1],newColor[2])
                        //console.log(color.x,color,.y)
                        //var colorNormalized=new THREE.Vector3(color.x/(Math.abs(color.x)+Math.abs(color.y)),color.y/(Math.abs(color.x)+Math.abs(color.y)),0)
                        //tempColors.push((colorNormalized.x+0.5),(colorNormalized.y+0.5),0)
                        //tempColors.push((colorNormalized.x+1)/2,(colorNormalized.y)/2,0)
                    }
                    else{
                        tempColors.push( 0, 0, 0)
                        lineColorsDir[trajId].push(0,0,0)
                        tempOpacitys.push(0)
                    }
                    


                }
                else{
                    tempColors.push( 0, 0, 0)
                    lineColorsDir[trajId].push(0,0,0)
                    tempOpacitys.push(0)
                }

                
            }
        }
        console.log(linePoints.length)
        console.log(linePoints)
        //console.log(tempOpacitys.length)
        //console.log(tempColors.length)
        //console.log(tempVertices.length)
        pointCloudMat=new THREE.PointsMaterial({ vertexColors: true,sizeAttenuation:true,size:volconfig.sliceThickness,transparent: true})
        customPointShader= new THREE.ShaderMaterial( {

            //uniforms:       uniforms,
            vertexShader:  `  
                attribute float alpha;
                attribute vec3 color;
                varying float vAlpha;
                varying vec3 vColor;
            
                void main() {
            
                    vAlpha = alpha;
                    vColor=color;
            
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            
                    gl_PointSize = 1.5;
            
                    gl_Position = projectionMatrix * mvPosition;
            
                }`,
                
            fragmentShader: `
                varying vec3 vColor;

                varying float vAlpha;
            
                void main() {
            
                    gl_FragColor = vec4( vColor, vAlpha );
            
                }`,
                
            transparent:true,
            depthWrite:false,
            
        
        });
        vertices= new Float32Array(tempVertices)
        colors=new Float32Array(tempColors)
        colorsIndividual=new Float32Array(tempColorsIndividual)
        opacitys=new Float32Array(tempOpacitys)
       

        //set up the Point Cloud
        var sliceGeometry=new THREE.BufferGeometry();
        pointCloudSlice=new THREE.Points(sliceGeometry,pointCloudMat)
        sliceScene.add(pointCloudSlice)
        updateSlice()
        
        pointCloudGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
        pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
        pointCloudGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute( opacitys, 1 ) );
        pointCloudMat=new THREE.PointsMaterial({ vertexColors: true,sizeAttenuation:false,size:1})
        particles=new THREE.Points(pointCloudGeometry,customPointShader)
        overviewScene.add(particles)
        
        


        //now add the lines
        var lineIndices=[]
        var pointCounter=0
        console.log(linePoints.length)
        for (var lineId=0;lineId<linePoints.length;lineId++){
            //console.log(linePoints[lineId])
            for(var pointId=0;pointId<linePoints[lineId].length/3-1;pointId++){
                //console.log(pointId)
                lineIndices.push(pointCounter)
                lineIndices.push(pointCounter+1)
                pointCounter++
            }
            //skip an Index here so the different trajectories dont end up getting connected
            pointCounter++
        }
        bufferLineGeometry=new THREE.BufferGeometry()
        var linePositionAttribute=new THREE.Float32BufferAttribute(linePoints.flat(1),3)
        console.log(linePositionAttribute)
        console.log(lineIndices)
        bufferLineGeometry.setAttribute("position",linePositionAttribute)
        bufferLineGeometry.setIndex(lineIndices)
        bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(lineColorsDir.flat(1),3))
        var customLineShader= new THREE.ShaderMaterial( {

            //uniforms:       uniforms,
            vertexShader:  `  
                attribute float alpha;
                attribute vec3 color;
                varying float vAlpha;
                varying vec3 vColor;
            
                void main() {
            
                    vAlpha = alpha;
                    vColor=color;
            
                    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            
                    gl_PointSize = 1.5;
            
                    gl_Position = projectionMatrix * mvPosition;
            
                }`,
                
            fragmentShader: `
                varying vec3 vColor;

                varying float vAlpha;
            
                void main() {
            
                    gl_FragColor = vec4( vColor, vAlpha );
            
                }`,
                
            transparent:true,
            depthWrite:false,
            blending: THREE.AdditiveBlending,
            
        
        });
        var linesMaterial=new THREE.LineBasicMaterial({ vertexColors:true,transparent:true,opacity:0.2} )
        lineSegments=new THREE.LineSegments(bufferLineGeometry,linesMaterial)
        overviewScene.add(lineSegments)

    });
    
    //load in the data for the volumetric shader
    response.text().then(function (text) {
        //console.log(text.length)

        

        const dataDensityArray=text.replace('[','').replace(']','').split(",").map(Number);
        //console.log(dataDensityArray)
        typedDensityArray=new Float32Array(dataDensityArray)
        // Texture to hold the volume. We have scalars, so we put our data in the red channel.
        // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
        // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
        // TODO: look the dtype up in the volume metadata
        
        
       // arraySlice=typedDensityArray.slice(frame*xLength*yLength, (frame+volconfig.sliceThickness)*xLength*yLength)


        
        
        // const typedArray1 = new Float32Array(xLength*yLength*zLength);
        // for (let i=0;i<typedArray1.length;i++){
        //     typedArray1[i]=Math.random();//i/typedArray1.length;
        // }
        
        //const dataTest=[1,1,1,1,0,0,0,0,0.5,0.5,0.5,0.5,0,0,0,0]
        //const texture = new THREE.Data3DTexture( volume.data, volume.xLength, volume.yLength, volume.zLength ); //volume.data is a 1D array containing values between 0 and 1
        texture = new THREE.Data3DTexture( typedDensityArray, xLength, yLength, zLength);
        //edit: the data  actually has exactly xLength*yLength*zLength entries
        
        texture.format = THREE.RedFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Colormap textures
        cmtextures = {
            viridis: new THREE.TextureLoader().load( 'cm_viridis.png', render ),
            gray: new THREE.TextureLoader().load( 'cm_gray.png', render ),
            rainbow: new THREE.TextureLoader().load( 'rgbMap.png', render )
        };

        

        

        // Material
        volumeShader = VolumeRenderShader1;

        const uniforms = THREE.UniformsUtils.clone( volumeShader.uniforms );

        uniforms[ 'u_data' ].value = texture;
        uniforms[ 'u_size' ].value.set( xLength, yLength, zLength);
        uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
        uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
        uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
        uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
        uniforms[ 'u_sliderPosMin'].value=-10;
        uniforms[ 'u_sliderPosMax'].value=-10;

        material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: volumeShader.vertexShader,
            fragmentShader: volumeShader.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );

        // THREE.Mesh
        const geometry = new THREE.BoxGeometry( xLength, yLength, zLength );
        geometry.translate( xLength / 2 - 0.5 , yLength / 2 - 0.5, zLength / 2 - 0.5 );

        densityVolume= new THREE.Mesh( geometry, material );
        //mesh.position.set(-250,0,0)
        overviewScene.add( densityVolume );
        
        

        /*textureSlice = new THREE.Data3DTexture( arraySlice, xLength, yLength, volconfig.sliceThickness);
        //edit: the data  actually has exactly xLength*yLength*zLength entries
        
        textureSlice.format = THREE.RedFormat;
        textureSlice.type = THREE.FloatType;
        textureSlice.minFilter = texture.magFilter = THREE.LinearFilter;
        textureSlice.unpackAlignment = 1;
        textureSlice.needsUpdate = true;*/

        // Material
        createVolumeSlice()
        /*const shaderSlice = VolumeRenderShader1;

        const uniformsSlice = THREE.UniformsUtils.clone( volumeShader.uniforms );

        uniformsSlice[ 'u_data' ].value = textureSlice;
        uniformsSlice[ 'u_size' ].value.set( xLength, yLength, volconfig.sliceThickness);
        uniformsSlice[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
        uniformsSlice[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
        uniformsSlice[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
        uniformsSlice[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

        materialSlice = new THREE.ShaderMaterial( {
            uniforms: uniformsSlice,
            vertexShader: shaderSlice.vertexShader,
            fragmentShader: shaderSlice.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );
        	
        // THREE.Mesh
        const geometrySlice = new THREE.BoxGeometry( xLength, yLength, 1 );
        geometrySlice.translate( xLength / 2 - 0.5 , yLength / 2 - 0.5, 1 / 2 - 0.5 );

        denistySlice = new THREE.Mesh( geometrySlice, materialSlice );
        sliceScene.add(denistySlice)*/
        
        //renderer.sortObjects = false;

        //Add slider plane
        const geometrySliderPlane = new THREE.BoxGeometry( xLength, yLength, 1 );
        geometrySliderPlane.translate( xLength / 2 - 0.5, yLength / 2 - 0.5, zLength / 2 - 0.5 );
        const sliderMat=new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.5,});//depthWrite:false
        sliderMesh = new THREE.Mesh( geometrySliderPlane,  sliderMat );
        sliderMesh.position.set(0,0,-zLength/2+frame)
        sliderMesh.renderOrder=1
        //overviewScene.add( sliderMesh );
        

        /*
        var objects=[]
        objects.add(sliderMesh);

        const controls = new DragControls( objects, camera, renderer.domElement );
        controls.addEventListener( 'dragstart', function ( event ) {

            event.object.material.emissive.set( 0xaaaaaa );
        
        } );
        
        controls.addEventListener( 'dragend', function ( event ) {
        
            event.object.material.emissive.set( 0x000000 );
        
        } );

        render();*/
        document.addEventListener('keydown', (event) => {
            var name = event.key;
            var code = event.code;
            // Alert the key name and key code on keydown
            //alert(`Key pressed ${name} \r\n Key code value: ${code}`);
            //}, false);
            if(event.key=="w"){
                
                //cameraSlice.position.z+=5

                //console.log(views[1].camera)
                //console.log(views[1].camera.position.y)
                //sliderObj.position.z=views[1].camera.position.z
                if(frame+2<zLength){
                    frame+=1
                    updateSlice()
                    //console.log(vertexSlice.length/3)
                }
                if(volconfig.showSlider){
                    material.uniforms[ 'u_sliderPosMin' ].value = frame;
                    material.uniforms[ 'u_sliderPosMax' ].value = frame+volconfig.sliceThickness;
                    sliderMesh.position.z=frame+volconfig.sliceThickness/2//-zLength/2+frame;
                }
                else{
                    material.uniforms[ 'u_sliderPosMin' ].value = -10;
                    material.uniforms[ 'u_sliderPosMax' ].value = -10;
                }

                //console.log("w pressed")
                render()
            }
            if(event.key=="s"){
                //cameraSlice.position.z-=5
                //sliderObj.position.z=views[1].camera.position.z
                //console.log("s pressed")
                if(frame-1>0){
                    frame-=1
                    updateSlice()

                }
                if(volconfig.showSlider){
                    material.uniforms[ 'u_sliderPosMin' ].value = frame;
                    material.uniforms[ 'u_sliderPosMax' ].value = frame+volconfig.sliceThickness;
                    sliderMesh.position.z=frame+volconfig.sliceThickness/2//-zLength/2+frame;
                }
                else{
                    material.uniforms[ 'u_sliderPosMin' ].value = -10;
                    material.uniforms[ 'u_sliderPosMax' ].value = -10;
                }
                
                render()
            }
        }, false);


    });
    //updateUniforms();
    window.addEventListener( 'resize', onWindowResize );

    
    

}

function createVolumeSlice(){
        sliceScene.remove(denistySlice)

        var upperBound=Math.min (frame+volconfig.sliceThickness,zLength-1)
        if(volconfig.volumeColorMode=='density'){arraySlice=typedDensityArray.slice(frame*xLength*yLength,upperBound*xLength*yLength)}
        if(volconfig.volumeColorMode=='direction'){arraySlice=typedDirectionArray.slice(frame*xLength*yLength,upperBound*xLength*yLength)}
        textureSlice = new THREE.Data3DTexture( arraySlice, xLength, yLength, upperBound-frame);
        //edit: the data  actually has exactly xLength*yLength*zLength entries
        
        textureSlice.format = THREE.RedFormat;
        textureSlice.type = THREE.FloatType;
        textureSlice.minFilter = texture.magFilter = THREE.LinearFilter;
        textureSlice.unpackAlignment = 1;
        textureSlice.needsUpdate = true;

        // Material
        const shaderSlice = VolumeRenderShader1;

        const uniformsSlice = THREE.UniformsUtils.clone( volumeShader.uniforms );

        uniformsSlice[ 'u_data' ].value = textureSlice;
        uniformsSlice[ 'u_size' ].value.set( xLength, yLength, upperBound-frame);
        uniformsSlice[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
        uniformsSlice[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
        uniformsSlice[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
        uniformsSlice[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

        materialSlice = new THREE.ShaderMaterial( {
            uniforms: uniformsSlice,
            vertexShader: shaderSlice.vertexShader,
            fragmentShader: shaderSlice.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );
        	
        // THREE.Mesh
        const geometrySlice = new THREE.BoxGeometry( xLength, yLength, upperBound-frame );
        geometrySlice.translate( xLength / 2 - 0.5 , yLength / 2 - 0.5, 1 / 2 - 0.5 );

        denistySlice = new THREE.Mesh( geometrySlice, materialSlice );
        sliceScene.add(denistySlice)
}

function updateSlice(){
    if(volconfig.showVolume){
       // arraySlice.set(typedDensityArray.slice(frame*xLength*yLength, (Math.min(frame+volconfig.sliceThickness,zLength))*xLength*yLength))
        //textureSlice.dataArray=arraySlice
        //textureSlice.needsUpdate=true 
        createVolumeSlice()
    }
    

    if(volconfig.showPoints){
        
        sliceScene.remove(pointCloudSlice)

        
        var vertexSlice=vertices.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+volconfig.sliceThickness])
        var colorSlice
        if(volconfig.pointColorMode=='individual')
            {colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+volconfig.sliceThickness])}
        if(volconfig.pointColorMode=='direction')
            {colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+volconfig.sliceThickness])}
        var opacitySlice=opacitys.slice(frameIndicesPoints[frame]/3, frameIndicesPoints[frame+volconfig.sliceThickness]/3).map(function(x) { return 1; })
        /*console.log(vertexSlice.length)
        console.log(colorSlice.length)
        console.log(opacitySlice.length)
        console.log(opacitySlice.length*3)*/
        var sliceGeometry=new THREE.BufferGeometry(); 
            sliceGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(vertexSlice),3))
            sliceGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( new Float32Array(colorSlice), 3 ) );
            sliceGeometry.setAttribute( 'alpha', new THREE.Float32BufferAttribute( new Float32Array(opacitySlice), 3 ) );
        //var sliceGeometry=new THREE.BufferGeometry(); 
        //sliceGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(tempVertices),3))
        pointCloudSlice=new THREE.Points(sliceGeometry,pointCloudMat)
        sliceScene.add(pointCloudSlice)
    }
   
    
}

function mapDirectionToColor(xVal,yVal){

    //vector to calculate angle against (should be 1 in length for easier angle calc)
    var x0=1
    var y0=0
    var length=Math.sqrt(xVal*xVal+yVal*yVal)
    //compute/set components of hsv color; mapping angle of the vector to the hue
    var angle=Math.asin((xVal*x0+yVal*y0)/length)
            //the angle is retruned in radiants (-PI/2,PI/2), contvert this interval to (0,360) (degrees)
    var hue=((angle+Math.PI/2)/Math.PI)*360
    var saturation=1
    var value=1
    //console.log(hue)
    var RGB=hsv2rgb(hue,saturation,value)
    //console.log(RGB)
    return RGB
}


//function taken from the internet to convert hsv to rgb (requirers als hsv values to be between 0 and 1)
function hsv2rgb(h,s,v) 
{                              
  let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];       
}  


function updateUniforms() {

    if(volconfig.showSlider){
        overviewScene.add(sliderMesh)
        var newGeometry=new THREE.BoxGeometry( xLength, yLength, volconfig.sliceThickness);
        sliderMesh.geometry=newGeometry;
        sliderMesh.position.x=50
        sliderMesh.position.y=50
        sliderMesh.position.z=frame+volconfig.sliceThickness/2
        //sliderMesh.position.set(10,100,-zLength/2+frame+volconfig.sliceThickness)
        //sliderMesh.updateMatrix();

        material.uniforms[ 'u_sliderPosMin' ].value = frame;
        material.uniforms[ 'u_sliderPosMax' ].value = frame+volconfig.sliceThickness;
        

        //materialSlice.uniforms[ 'u_sliderPos' ].value = frame;
    }
    else{
        
        material.uniforms[ 'u_sliderPosMin' ].value = -10;
        material.uniforms[ 'u_sliderPosMax' ].value = -10;
        //materialSlice.uniforms[ 'u_sliderPos' ].value = -10;
        overviewScene.remove(sliderMesh)
    }
    
    //sliderMesh.
    if(volconfig.volumeColorMode=='density'){material.uniforms[ 'u_data' ].value = texture};// texture; //}
    if(volconfig.volumeColorMode=='direction'){material.uniforms[ 'u_data' ].value = directionTexture};// texture; //}
    
    material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
    material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
    
    if(volconfig.pointColorMode=='individual'){pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colorsIndividual, 3 ) );}
    if(volconfig.pointColorMode=='direction'){pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );}

    if(volconfig.lineColorMode=='individual'){bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(lineColorsInd.flat(1),3))}
    if(volconfig.lineColorMode=='direction'){bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(lineColorsDir.flat(1),3))}

    materialSlice.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    materialSlice.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
    materialSlice.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    materialSlice.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
   
    //material.uniforms['showSlider'].value
    
    if(volconfig.showPoints){
        overviewScene.add(particles)
        sliceScene.add(pointCloudSlice)
    }
    else{
        overviewScene.remove(particles)
        sliceScene.remove(pointCloudSlice)
    }
    if(volconfig.showLines){overviewScene.add(lineSegments)}
    else{overviewScene.remove(lineSegments)}

    if(volconfig.showVolume){
        overviewScene.add(densityVolume)
        sliceScene.add(denistySlice)
    }
    else{
        overviewScene.remove(densityVolume)
        sliceScene.remove(denistySlice) 
    }
    
    //views[1].camera.far=volconfig.farClippingPlane;
    // console.log(views[1].camera.far)
    // console.log(volconfig.farClippingPlane)
    updateSlice();
    render();
    

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    const aspect = window.innerWidth / window.innerHeight;

    const frustumHeight = cameraOverview.top - cameraOverview.bottom;

    cameraOverview.left = - frustumHeight * aspect / 2;
    cameraOverview.right = frustumHeight * aspect / 2;

    cameraOverview.updateProjectionMatrix();

    const frustumHeightSlice = cameraSlice.top - cameraSlice.bottom;

    cameraSlice.left = - frustumHeightSlice * aspect / 2;
    cameraSlice.right = frustumHeightSlice * aspect / 2;

    cameraSlice.updateProjectionMatrix();

    render();

}

function renderOverview(){

}
function renderSlice(){

}

function OnCameraChange(){
    // console.log(cameraOverview.position)
    // console.log(cameraOverview.quaternion)
    // console.log(cameraOverview.zoom)
    render()
}

function render() {

    renderer.setScissorTest(true)

    renderer.setScissor(0, 0, window.innerWidth / 2 - 2, window.innerHeight)
    renderer.render( overviewScene, cameraOverview)

    renderer.setScissor(
        window.innerWidth / 2,
        0,
        window.innerWidth / 2 - 2,
        window.innerHeight
    )
    renderer.render(sliceScene, cameraSlice)
    
    renderer.setScissorTest(false)



    // for ( let ii = 0; ii < views.length; ++ ii ) {

    //     const view = views[ ii ];
    //     const camera = view.camera;

        // view.updateCamera( camera, overviewScene );

        // const left = Math.floor( window.innerWidth * view.left );
        // const bottom = Math.floor( window.innerHeight * view.bottom );
        // const width = Math.floor( window.innerWidth * view.width );
        // const height = Math.floor( window.innerHeight * view.height );

        // renderer.setViewport( left, bottom, width, height );
        // renderer.setScissor( left, bottom, width, height );
        // renderer.setScissor(0, 0, window.innerWidth / 2 - 2, window.innerHeight)
        // renderer.setScissorTest( true );
        // // renderer.setClearColor( new THREE.Color().setRGB( 0, 0, 0, THREE.SRGBColorSpace ) );

        // // camera.aspect = width / height;
        // // camera.updateProjectionMatrix();

        // renderer.render( overviewScene, cameraOverview );
        // renderer.render(sliceScene , cameraSlice );

    // }
    //console.log(views[0].camera.position)
    //console.log(views[0].camera.up)
    //console.log(views[0].camera)
    //renderer.render( scene, camera );
    stats.update();

}

init();