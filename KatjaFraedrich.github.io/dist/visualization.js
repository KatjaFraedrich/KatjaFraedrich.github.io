import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from './js/three.module.js'//'https://unpkg.com/three@0.127.0/build/three.module.js';
//import{ConvexGeometry} 
//import Stats from './js/stats.min.js';
import { GUI } from 'https://unpkg.com/three@0.127.0/examples/jsm/libs/dat.gui.module.js';

import { DragControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/DragControls.js';
import { NRRDLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/NRRDLoader.js';
import { VolumeRenderShader1 } from './volumeShader.js'//'https://unpkg.com/three@0.127.0/examples/jsm/shaders/VolumeShader.js';
import { ConvexGeometry } from 'https://unpkg.com/three@0.127.0/examples/jsm/geometries/ConvexGeometry.js';
import {BufferGeometryUtils}  from  './js/BufferGeometryUtils.js' //'https://unpkg.com/three@0.127.0/examples/jsm/utils/BufferGeometryUtils.js';

//import { debug } from 'webpack';
//import WebGL from 'three/addons/capabilities/WebGL.js';



//fetch all the data
let responseStats=await fetch('http://127.0.0.1:5000/stats',{method: 'GET',});
let responseDir= await fetch('http://127.0.0.1:5000/direction10K',{method: 'GET',});
let responseSplines = await fetch('http://127.0.0.1:5000/splines',{method: 'GET',});
let response = await fetch('http://127.0.0.1:5000/density10K',{method: 'GET',});
let responseTraj = await fetch('http://127.0.0.1:5000/traj10K',{method: 'GET',});

//let responseSplineTraj = await fetch('http://127.0.0.1:5000/clusterTraj',{method: 'GET', });


// const stats = new Stats()
// stats.setMode(0);
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = '0';
// stats.domElement.style.top = '0';
// document.body.appendChild( stats.domElement );



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
let orbitControls,dragControls
let controlsSlice,materialSlice,sliceSettings,arraySlice,guiSlice,pointSettingsSlice,lineSettingsSlice,volumeSettingsSlice,pointCloudSlice,textureSlice,denistySlice
var  material 
var frame=30


var  volconfig;

var  cmtextures;
var sliderMesh; 
var particles;
var points;

var colors;
var colorsIndividual;
var opacitys;
var typedDensityArray

//var dataArray=[]
var texture;
var pointCloudGeometry = new THREE.BufferGeometry(); 
var sliceGeometry =new THREE.BufferGeometry(); 
var vertices ;
var densityVolume;
var frameIndicesPoints;
var volumeShader;
var customPointShader
var pointCloudMat
var trajDataArray
var directionTexture
var typedDirectionArray

var linesMaterial
var customLineShader
var lineSegments
var lineSlices
var bufferLineGeometry
var lineIndicesArray
var bufferLineSliceGeometry

var splineLOD_Data
var splineTrajData
var splineObjects=[]
var splineSliceObjects=[]
var filteredTraj=[]
var filteredSplines=[]
var splineVertices=[];
var splineAngles=[]
var colorsClusters;
var splineColor;
//var splineCount=20

var xLength,yLength,zLength;
//const yLength=100;
//const zLength=96;//929;
var minX, maxX,minY,maxY



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
    divLeft.className="leftCanvas"
    divLeft.id="divLeft"
    divLeft.style.width = "50%";
    divLeft.style.float= "left"
    divLeft.style.height = "100%"//"100px";
    divLeft.style.position="absolute"
    divLeft.style.top="0"
    //divLeft.style.background = "red";
    //divLeft.addEventListener( 'mousedown', onMouseClick );
    document.body.appendChild(divLeft);
    document.getElementById("divLeft").addEventListener( 'pointerdown', onMouseClick );

    var divRight = document.createElement("div");
    divRight.className="rightCanvas"
    divRight.style.width = "50%";
    divRight.style.float= "right"
    divRight.style.height = "100%"//"100px";
    divRight.style.position="absolute"
    //divRight.style.background = "blue";
    divRight.style.top="0"
    divRight.style.left="50%"
    document.body.appendChild(divRight);
    
    
    // Create controls
    orbitControls = new OrbitControls( cameraOverview,divLeft  );//renderer.domElement
    orbitControls.addEventListener( 'change', OnCameraChange );
    orbitControls.target.set(50,50,50)
    orbitControls.position0.set(470,-800,70)
    
    //controls.target.set( 64, 64, 128 );
    //controls.minZoom = 0.5;
    //controls.maxZoom = 4;
    //controls.enablePan = false;
    orbitControls.update();

    
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

    //Add slider plane
    const geometrySliderPlane = new THREE.BoxGeometry( xLength, yLength, 1 );
    geometrySliderPlane.translate( xLength / 2 - 0.5, yLength / 2 - 0.5, zLength / 2 - 0.5 );
    const sliderMat=new THREE.MeshLambertMaterial({color: 0x00ff00, transparent: true, opacity: 0.5,});//depthWrite:false
    sliderMesh = new THREE.Mesh( geometrySliderPlane,  sliderMat );
    sliderMesh.position.set(0,0,-zLength/2+frame)
    sliderMesh.renderOrder=1
    //overviewScene.add( sliderMesh );
    var dragObjArray=[]
    dragObjArray.push(sliderMesh)
    
    // dragControls=new DragControls(dragObjArray,cameraOverview,divLeft)
    // dragControls.addEventListener( 'change', OnCameraChange );
    // dragControls.addEventListener('dragstart', function (event) {orbitControls.enabled=false})
    // dragControls.addEventListener ( 'drag', function( event ){
    //     frame=Math.round(sliderMesh.position.z-sliceSettings.sliceThickness/2)
    //     sliderUpdate(false)
    //     updateSlice(false)
    // })
    // dragControls.addEventListener('dragend', function (event) {orbitControls.enabled=true})
    // dragControls.enabled=false;

    // The gui for interaction
    volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis',showSlider:false,showPoints:true,pointColorMode:'direction',showLines:true,lineColorMode:'direction',lineOpacity:0.5,showVolume:true,volumeColorMode:'density' ,showClusters:true,clusterCount:20, clusterOpacity:0.4, clusterColorMode:'size', clusterShape:'convexHull'};
    const guiOverview = new GUI( { autoPlace: false });

    guiOverview.add( volconfig, 'showSlider').onChange( sliderUpdate );

    const volumeFolder=guiOverview.addFolder('Volume Settings')
    volumeFolder.add( volconfig, 'showVolume').onChange( updateUniforms );
    volumeFolder.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
    volumeFolder.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );  
    volumeFolder.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
    volumeFolder.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms ); 
    volumeFolder.add( volconfig, 'volumeColorMode', { density: 'density', direction: 'direction' } ).onChange( updateUniforms );
    volumeFolder.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis',rainbow:'rainbow' } ).onChange( updateUniforms );

  
    
    

    const pointSettings=guiOverview.addFolder('PointCloud Settings')
    pointSettings.add( volconfig, 'showPoints').onChange( updateUniforms);
    pointSettings.add( volconfig, 'pointColorMode', { individual: 'individual', direction: 'direction', cluster:'cluster' } ).onChange( updateUniforms );

    const lineSettings=guiOverview.addFolder('Line Settings')
    lineSettings.add( volconfig, 'showLines').onChange( updateUniforms );
    lineSettings.add( volconfig, 'lineColorMode', { individual: 'individual', direction: 'direction' , cluster:'cluster'} ).onChange( updateUniforms );
    lineSettings.add( volconfig, 'lineOpacity', 0, 1, 0.01 ).onChange( updateUniforms );  

    const clusterSettings=guiOverview.addFolder('Cluster Settings')
    clusterSettings.add( volconfig, 'showClusters').onChange( createSplines );
    clusterSettings.add( volconfig, 'clusterCount', 1, 100, 1).onChange( createSplines );
    clusterSettings.add( volconfig, 'clusterOpacity', 0, 1, 0.01 ).onChange( createSplines );
    clusterSettings.add( volconfig, 'clusterColorMode', { size: 'size', direction: 'direction', selection:'selection', individual:'individual' } ).onChange( createSplines );
    clusterSettings.add( volconfig, 'clusterShape', { convexHull: 'convexHull', centroid: 'centroid' } ).onChange( createSplines);
   
    var guiContainer= document.createElement("div");
    //divLeft.className="leftCanvas"
    //guiContainer.style.width = "50%";
    guiContainer.style.float= "left"
    //guiContainer.style.height = "100%"//"100px";
    guiContainer.style.position="absolute"
    guiContainer.style.top="0"
    //divLeft.style.background = "red";
    document.body.appendChild(guiContainer);
    guiContainer.appendChild(guiOverview.domElement)


    sliceSettings={ syncToOverview:false,clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis',showPoints:true,pointColorMode:'direction',showLines:true,lineColorMode:'direction',lineOpacity:0.5,sliceThickness: 1,showVolume:true,volumeColorMode:'density',showClusters:true, clusterOpacity:0.4, clusterColorMode:'size', clusterShape:'convexHull'  };
    guiSlice = new GUI( );
    guiSlice.domElement.id='gui_Slice'
    guiSlice.add(sliceSettings,'syncToOverview').onChange(syncSettings)
    guiSlice.add( sliceSettings, 'sliceThickness', 1, 100, 1).onChange( onThicknessChange);
    volumeSettingsSlice=guiSlice.addFolder('Volume Settings')
    volumeSettingsSlice .add(sliceSettings, 'showVolume').onChange( fullSliceUpdate );
    volumeSettingsSlice .add( sliceSettings, 'clim1', 0, 1, 0.01 ).onChange( updateSliceSettings );
    volumeSettingsSlice .add( sliceSettings, 'clim2', 0, 1, 0.01 ).onChange( updateSliceSettings );
    volumeSettingsSlice .add( sliceSettings, 'volumeColorMode', { density: 'density', direction: 'direction' } ).onChange( fullSliceUpdate );
    volumeSettingsSlice .add( sliceSettings, 'colormap', { gray: 'gray', viridis: 'viridis',rainbow:'rainbow' } ).onChange( updateSliceSettings );
    volumeSettingsSlice .add( sliceSettings, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateSliceSettings );
    volumeSettingsSlice. add( sliceSettings, 'isothreshold', 0, 1, 0.01 ).onChange( updateSliceSettings );
     
    pointSettingsSlice=guiSlice.addFolder("PointCloud Settings")
    pointSettingsSlice .add( sliceSettings, 'showPoints').onChange( fullSliceUpdate );
    pointSettingsSlice .add( sliceSettings, 'pointColorMode', { individual: 'individual', direction: 'direction',cluster:'cluster' } ).onChange( updateSliceSettings );

    lineSettingsSlice=guiSlice.addFolder("Line Settings")
    lineSettingsSlice .add( sliceSettings, 'showLines').onChange( fullSliceUpdate );
    lineSettingsSlice .add( sliceSettings, 'lineColorMode', { individual: 'individual', direction: 'direction', cluster:'cluster' } ).onChange( updateSliceSettings );
    lineSettingsSlice .add( sliceSettings, 'lineOpacity', 0, 1, 0.01 ).onChange( updateSliceSettings );

    const clusterSettingsSlice=guiSlice.addFolder('Cluster Settings')
    clusterSettingsSlice.add( sliceSettings, 'showClusters').onChange( createSlicedSplines );
    clusterSettingsSlice.add( sliceSettings, 'clusterOpacity', 0, 1, 0.01 ).onChange( updateClusterVisuals );
    clusterSettingsSlice.add( sliceSettings, 'clusterColorMode', { size: 'size', direction: 'direction', selection:'selection', individual:'individual' } ).onChange( updateClusterVisuals );
    clusterSettingsSlice.add( sliceSettings, 'clusterShape', { convexHull: 'convexHull', centroid: 'centroid' } ).onChange( createSlicedSplines);
    
    // Load the data ...
    
    responseStats.text().then(function (text) {
        var stats=text.split(' ')
        xLength=stats[0]
        yLength=stats[1]
        zLength=stats[2]
        minX=stats[3]
        maxX=stats[4]
        minY=stats[5]
        maxY=stats[6]
    });
    //directionTexture for volume 
    responseDir.text().then(function (text) {
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
        trajDataArray=JSON.parse("[" +text+"]")
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
        linesMaterial=new THREE.LineBasicMaterial({ vertexColors:true,transparent:true,opacity:0.6} )
        

        customLineShader= new THREE.ShaderMaterial( {
            uniforms: {
                'u_AlphaMultiplier': { value: 0.01 },  //multiplier for line opacities for whole volume
            },
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
            
                    
            
                    gl_Position = projectionMatrix * mvPosition;
            
                }`,
                
            fragmentShader: `
                varying vec3 vColor;
                uniform float u_AlphaMultiplier;
                varying float vAlpha;
            
                void main() {
            
                    gl_FragColor = vec4( vColor, vAlpha*u_AlphaMultiplier );
            
                }`,
                
            transparent:true,
            depthWrite:false,
            blending: THREE.AdditiveBlending,
            
        
        });

        processTrajData(text)
        
        
        // vertices= new Float32Array(tempVertices)
        // colors=new Float32Array(tempColors)
        // colorsIndividual=new Float32Array(tempColorsIndividual)
        // opacitys=new Float32Array(tempOpacitys)
       

        //set up the Point Cloud
        // sliceGeometry=new THREE.BufferGeometry();
        // pointCloudSlice=new THREE.Points(sliceGeometry,pointCloudMat)
        // sliceScene.add(pointCloudSlice)
        updateSlice(true)
        createSplines()
        redrawOverviewScene()
        updateUniforms()
        // pointCloudGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
        // pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
        // pointCloudGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute( opacitys, 1 ) );
        // pointCloudMat=new THREE.PointsMaterial({ vertexColors: true,sizeAttenuation:false,size:1})
        // particles=new THREE.Points(pointCloudGeometry,customPointShader)
        // overviewScene.add(particles)
        
        // if(!volconfig.showLines){
        //     return
        // }
        
        
        //now add the lines
        // bufferLineGeometry=new THREE.BufferGeometry()
        // var linePositionAttribute=new THREE.Float32BufferAttribute(vertices,3)
        // bufferLineGeometry.setAttribute("position",linePositionAttribute)
        // bufferLineGeometry.setIndex(lineIndicesArray.flat(1))
        // bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3))
        // bufferLineGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute( opacitys, 1 ))
        
        //  lineSegments=new THREE.LineSegments(bufferLineGeometry,customLineShader)
        //  overviewScene.add(lineSegments)

        

        
        
        
        

    });
    //load in the data which maps which traj are aggregated in which cluster
    // responseSplineTraj.text().then(function (text) {
    //     splineTrajData=JSON.parse("[" +text+"]")[0]
    //     //console.log(stringArray[0][0])
    //     splineTrajData=splineTrajData.map((x)=>(JSON.parse("[" +x[0]+"]"))[0])
    //     //console.log(stringArray)


    // });
        
    //load in the data for the volumetric shader
    response.text().then(function (text) {
        //console.log(text.length)

        const dataDensityArray=text.replace('[','').replace(']','').split(",").map(Number);
        typedDensityArray=new Float32Array(dataDensityArray)
        
        texture = new THREE.Data3DTexture( typedDensityArray, xLength, yLength, zLength);
        //the data   has exactly xLength*yLength*zLength entries
        
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
        

        createVolumeSlice()

        


    });  
    
    //positions for all the splines (for all lods)
    responseSplines.text().then(function (text) {
        //console.log("processing splines")
        var stringArray=JSON.parse("[" +text+"]")
        //console.log(stringArray)
        //console.log(stringArray.length)
        //console.log(stringArray[0])
        splineTrajData=Array(40000).fill(0)
        splineLOD_Data=[]
        //console.log(splineTrajData)
        for (var i=0;i<stringArray[0].length;i++){  
            //var spline=JSON.parse("[" +stringArray[0][i]+"]")
            var splines=[]
            
            for (var j=0;j<stringArray[0][i].length;j++){  //iterate over the spline LODS ,i in (0,99)
                var spline=JSON.parse("[" +stringArray[0][i][j]+"]")//[parseInt(stringArray[0][i][j][0]),stringArray[0][i][j][1]]
                //console.log(spline)
                var splineIndex=0
                for(var s=0;s<spline.length;s++){//iterate over each spline
                    //spline[s][3]=JSON.parse(spline[s][3]).map(Number)
                    spline[s][3]=spline[s][3].map(Number)
                    spline[s][2]=splineIndex
                    splineIndex++
                    //console.log(spline[s],spline[s][0],spline[s][3].length,spline[s][3])
                    // for( var t=0;t<spline[0][3].length;t++){
                    //     var traj=spline[0][3][t]
                    //     splineTrajData[traj].push(spline[s][0])
                    // }
                    //spline[s][3].forEach((traj)=> splineTrajData[traj].push(spline[s][0]))
                }
                //console.log(splineTrajData)
                splines.push(spline)
            }
            //console.log(splines)
            splineLOD_Data.push(splines[0])
            
        }
        for(var i=0;i<splineTrajData.length;i++){
                splineTrajData[i]=[]
        }
        for(var l=0;l<splineLOD_Data.length;l++){
            //console.log(splineLOD_Data[l].length,splineTrajData )
            //console.log(splineTrajData.length)
            
            for(var s=0;s<splineLOD_Data[l].length;s++){
                //console.log(splineLOD_Data[l].length,splineLOD_Data[l][s][3].length,splineTrajData)
                for(var t=0;t<splineLOD_Data[l][s][3].length;t++){
                    //console.log(l,s,t,splineLOD_Data[l][s][3][t])
                    splineTrajData[splineLOD_Data[l][s][3][t]][l]=splineLOD_Data[l][s][2]
                }
            }
        }
        console.log(splineTrajData)
        //console.log(splineLOD_Data[0][0][0],splineLOD_Data[0][0][3][0],splineLOD_Data[0][0][3][1])
        console.log(splineLOD_Data)
        createSplines()
        createSlicedSplines()
    });
    //updateUniforms();
    window.addEventListener( 'resize', onWindowResize );
    document.addEventListener('keydown', (event) => {

            if(event.key=="w"){

                if(frame+2<zLength){
                    frame+=1
                    updateSlice(false)
                    sliderUpdate(true)

                }

            }
            if(event.key=="s"){

                if(frame-1>0){
                    frame-=1
                    updateSlice(false)
                    sliderUpdate(true)
                    //createLineSegments()

                }
                
            }
            if(event.key=="c"){
                
                filteredSplines=[]
                filteredTraj=[]
                processTrajData()
                fullSliceUpdate()
                redrawOverviewScene()
                render()
                console.log("cleared selection")
            }
        }, false);

    
    

}

function processTrajData(recalcSplinePoints){
    var dataArray=[]
    var tempVertices=[]
    //console.log(filteredTraj)
    if(filteredTraj.length>0){console.log(filteredTraj[0])}
    //console.log(filteredTraj.type)
    var tempColors=[]
    var tempOpacitys=[]
    var tempColorsIndividual=[]
    var tempColorsClusters=[]
    frameIndicesPoints=[]
    var clusterLOD=splineLOD_Data.length-volconfig.clusterCount
    if(recalcSplinePoints){
        splineVertices=[]
        splineAngles=[]
        for(var s=0;s<splineLOD_Data[clusterLOD].length;s++){
            splineVertices.push([])
            splineAngles.push([])
        }
        
    }
    lineIndicesArray=[]
    var indexPointer=0
    var maxTrajId=-1
    var minTrajId=10000000
    //var allSplineIds=new Set(splineTrajData.map(x=>x[clusterLOD]))
    //console.log("all spline id's "+Array.from(allSplineIds).join(' '))
    var shownSplines=[]
    //console.log(trajDataArray[0].length)
    for(var i=0;i<trajDataArray[0].length;i++ ){
        dataArray.push([])
        lineIndicesArray.push([])
        frameIndicesPoints.push(tempVertices.length)
        for(var s=0;s<splineLOD_Data[clusterLOD].length;s++){
            splineVertices[s].push([])
            splineAngles[s].push([])
        }
        //console.log("frame "+i+" length: "+trajDataArray[0][i][1].length)
        for(var j=0;j<trajDataArray[0][i][1].length;j++){
            var dataEntry=trajDataArray[0][i][1][j].replace('[','').replace(']','').split(",").map(Number)
            var trajId=dataEntry[7]
            dataEntry.push(indexPointer)
            dataArray[i].push(dataEntry)
            if(trajId>maxTrajId){maxTrajId=trajId}
            if(trajId<minTrajId){minTrajId=trajId}
            if(recalcSplinePoints && splineTrajData[trajId].length>0){
                //console.log(splineTrajData[trajId][clusterLOD],splineVertices.length)
                var x=((dataArray[i][j][0]-minX)/(maxX-minX))*xLength
                var y=((dataArray[i][j][1]-minY)/(maxY-minY))*yLength
                var pos=new THREE.Vector3(x,y,i)
                splineVertices[splineTrajData[trajId][clusterLOD]][i].push(pos)
                if(dataArray[i][j][2]!=-1){
                    var index=dataArray[i][j][2]
                    var x2=((dataArray[i-1][index][0]-minX)/(maxX-minX))*xLength
                    var y2=((dataArray[i-1][index][1]-minY)/(maxY-minY))*yLength
                    
                    var pos2=new THREE.Vector3(x2,y2,i-1)//(dataArray[i-1][index][0]/7000)*xLength,(dataArray[i-1][index][1]/7000)*yLength,i-1)
                    var xVal=pos.x-pos2.x
                    var yVal=pos.y-pos2.y
                    var length=Math.sqrt(xVal*xVal+yVal*yVal)
                    var x0=0
                    var y0=-1
                    var dot=xVal*x0+yVal*y0
                    var det=xVal*y0-yVal*x0
                    var angle=Math.atan2(det,dot)
                    //var angle=Math.asin((xVal*x0+yVal*y0)/length)
                    splineAngles[splineTrajData[trajId][clusterLOD]][i].push((angle+Math.PI)/(Math.PI*2))//((angle+Math.PI/2)/Math.PI))

                }
            }
            //if(filteredTraj.length==0 ){//|| filteredTraj.includes(trajId)
                
                //shownTraj.push(trajId)
                
                if(filteredTraj.length!=0){
                    if(splineTrajData[trajId].length==0){continue}
                    if(!filteredSplines.includes(splineTrajData[trajId][clusterLOD])){continue}
                    //console.log("added "+ trajId+" "+filteredTraj.includes(trajId)+" "+filteredTraj )
                    //if(!filteredTraj.includes(trajId)){console.log("added wrong traj")}
                    shownSplines.push(splineTrajData[trajId][clusterLOD])
                }
                
                
                
                // if( ){
                //     //console.log(trajId)
                //     if(!){continue}
                //     //if(splineTrajData[trajId].length==0){continue} //the traj was not used in the clustering (because to short)
                //     // splineId=splineTrajData[trajId][clusterLOD]
                //     //console.log(trajId,splineId,filteredTraj.includes(splineId))
                //     //if( !filteredTraj.includes(splineId)){continue} //if there is a filter active and the traj
                //     
                // }
            
                // if(i==1 && j==1){
                //     console.log(dataEntry)
                //     console.log(dataArray[i][j])
                // }
                indexPointer++
                var vertex= new THREE.Vector3();
                vertex.x=((dataArray[i][j][0]-minX)/(maxX-minX))*xLength
                vertex.y=((dataArray[i][j][1]-minY)/(maxY-minY))*yLength
                vertex.z=i
                tempVertices.push(vertex.x)
                tempVertices.push(vertex.y)
                tempVertices.push(vertex.z)
                var hsvInd=hsv2rgb(dataArray[i][j][4]*360,1,1)
                tempColorsIndividual.push(hsvInd[0],hsvInd[1],hsvInd[2])//(dataArray[i][j][4],dataArray[i][j][5],dataArray[i][j][6])
                if(splineTrajData[trajId].length>0){
                    var hsvCluster=hsv2rgb(splineTrajData[trajId][clusterLOD]/volconfig.clusterCount*360,1,1)
                    tempColorsClusters.push(hsvCluster[0],hsvCluster[1],hsvCluster[2])
                }
                else{
                    tempColorsClusters.push(1,1,1)}
                
                if(i>0){
                    
                    var prevIndex=dataArray[i][j][2]
                    //console.log(prevIndex,i,j,dataArray[i-1].length)
                    if(prevIndex!=-1 && prevIndex<dataArray[i-1].length){
                        var prevVertex=new THREE.Vector3(((dataArray[i-1][prevIndex][0]-minX)/(maxX-minX))*xLength,((dataArray[i-1][prevIndex][1]-minY)/(maxY-minY))*yLength,i);
                        var color=new THREE.Vector3(vertex.x-prevVertex.x,vertex.y-prevVertex.y,0 )
                        var length=Math.sqrt(color.x*color.x+color.y*color.y)
                        var newColor=mapDirectionToColor(color.x,color.y,false)
                        tempOpacitys.push(length)
                        tempColors.push(newColor[0],newColor[1],newColor[2])
                        lineIndicesArray[i].push(dataArray[i-1][prevIndex][8])
                        lineIndicesArray[i].push(dataArray[i][j][8])
                    }
                    else{
                        tempColors.push( 0, 0, 0)
                        tempOpacitys.push(0)
                    }
                }
                else{
                    tempColors.push( 0, 0, 0)
                    tempOpacitys.push(0)
                }
            //}
            

            
        }
    }
    //console.log("minTraj Id: "+minTrajId+", manxTrajId: "+maxTrajId)
    //console.log("shown splines: "+ Array.from(new Set(shownSplines)))
    //console.log(splineVertices)
    //console.log(tempVertices.length)
    vertices= new Float32Array(tempVertices)
    //console.log("vertices length: "+vertices.length)
    colors=new Float32Array(tempColors)
    colorsIndividual=new Float32Array(tempColorsIndividual)
    colorsClusters=new Float32Array(tempColorsClusters)
    opacitys=new Float32Array(tempOpacitys)
    console.log(splineAngles)
}

function createSplines(){
    // if(splineObjects.length==splineLOD_Data.length-volconfig.clusterCount && volconfig.showClusters){ //no changes necessary
    //     return
    // }
    var currentTrajCount=splineObjects.length
    for( var i=0;i<splineObjects.length;i++){
        overviewScene.remove(splineObjects[i])
    }
    splineObjects=[]
    if(!volconfig.showClusters){
        return
    }
    var clusterIndex=splineLOD_Data.length-volconfig.clusterCount
    //console.log(splineVertices.length)
    //console.log(splineLOD_Data[clusterIndex].length)
    
    
    
    if(splineVertices.length!=splineLOD_Data[clusterIndex].length){
        processTrajData(true)
    }
    //console.log(splineLOD_Data)
    //console.log(splineLOD_Data.length)
    var splineData=splineLOD_Data[clusterIndex]
    //console.log(splineData)
    var maxPointsPerCluster=splineLOD_Data[splineLOD_Data.length-1][0][0]
    
    for( var splineId=0;splineId<splineData.length;splineId++ ){



        var splinePoints=[]
        //console.log(splineId)
        //console.log(splineData[splineId])
        //console.log(splineData[splineId][1])
        for(var  pointId=0;pointId<splineData[splineId][1].length;pointId=pointId+3){
            //console.log(splineData[splineId])
            var point=splineData[splineId][1]
            //console.log(point)
            splinePoints.push(new THREE.Vector3(((point[pointId]-minX)/(maxX-minX))*xLength,((point[pointId+1]-minY)/(maxY-minY))*yLength,point[pointId+2]))
        }
        //splinePoints[splinePoints.length-1]+=Math.random()*0.1
        //console.log(splinePoints)
        var curve=new THREE.CatmullRomCurve3(splinePoints)
        //const points = curve.getPoints( 50 );
        //console.log(points)
        //const geometry = new THREE.BufferGeometry().setFromPoints( splinePoints );
        var splineThickness=Math.sqrt(splineData[splineId][0]/maxPointsPerCluster)*25//Math.sqrt(splineData[splineId][0]/2)Math.sqrt(splineData[splineId][0]/maxPointsPerCluster) //
        
        var hsvColor;
        if(volconfig.clusterColorMode=='direction'){hsvColor=mapDirectionToColor(curve.getPoint(1).x-curve.getPoint(0).x,curve.getPoint(1).y-curve.getPoint(0).y,true)}
        if(volconfig.clusterColorMode=='size'){hsvColor=hsv2rgb(splineData[splineId][0],1,1)}
        if(volconfig.clusterColorMode=='individual'){hsvColor=hsv2rgb(splineId/splineData.length*360,1,1)}
        if(volconfig.clusterColorMode=='selection'){
            if(filteredSplines.includes(splineId) ){hsvColor=hsv2rgb(360,1,1)}
            else{hsvColor=hsv2rgb(180,1,1)}
        }
        //var hsVDirectionColor=
        //var hsvArray=hsv2rgb(splineData[splineId][0],1,1)
        var colorCluster=new THREE.Color(hsvColor[0],hsvColor[1],hsvColor[2])//new THREE.Color(Math.random(),Math.random(),Math.random())
        //console.log(colorRand)
        const material = new THREE.MeshBasicMaterial( { color: colorCluster, transparent:true, opacity:volconfig.clusterOpacity} );


        if(volconfig.clusterShape=='convexHull'){
            //console.log(splineVertices[splineId])
            
            var splineGeometry=new ConvexGeometry(splineVertices[splineId].flat(1) );
            var SplineMesh=new THREE.Mesh(splineGeometry, material);
            SplineMesh.userData={Id:splineData[splineId][2],trajCount:splineData[splineId][0], traj:splineData[splineId][3], originalId:splineId}
            splineObjects.push(SplineMesh)
            overviewScene.add(SplineMesh)
        }
        if(volconfig.clusterShape=='centroid'){
            // Create the tube object to add to the scene
            var radialSegments=8
            var geometrySpline=new THREE.TubeGeometry(curve,zLength-1, splineThickness,radialSegments,false)
            //console.log(geometrySpline)
            geometrySpline=geometrySpline.toNonIndexed()
            //var tempAlpha=[]
            var tempColors=[]
            //console.log(geometrySpline)
            //console.log(geometrySpline.attributes.position.array.length)
            for(var frame=0;frame<zLength;frame++){
                var bins=Array(radialSegments).fill(0); 
                //console.log(splineAngles[splineId][frame].length)
                for(var pointId=0;pointId<splineAngles[splineId][frame].length;pointId++)
                {
                    var binId=Math.floor(splineAngles[splineId][frame][pointId]*(radialSegments))
                    //console.log(binId)
                    bins[binId]+=1
                }
                //console.log(bins)
                for(var segment=0;segment<radialSegments;segment++){
                    //  if(segment==radialSegments){
                    //     tempColors.push(colorCluster.r,colorCluster.g,colorCluster.b,volconfig.clusterOpacity*bins[0]/splineAngles[splineId][frame].length)
                    // }
                    // else{
                        for(var v=0;v<6;v++){
                            tempColors.push(colorCluster.r,colorCluster.g,colorCluster.b,volconfig.clusterOpacity*bins[segment]/splineAngles[splineId][frame].length)
                        }
                        
                    // }
                    //tempAlpha.push(255*Math.random())
                    //tempColors.push(colorCluster.r,colorCluster.g,colorCluster.b,bins[segment]/splineAngles[splineId][frame].length)
                    //tempColors.push(colorCluster.r,colorCluster.g,colorCluster.b,segment/(radialSegments+1))

                    // var alpha=0.1
                    // if(segment==8 || segment==0 || segment==4){alpha=0.9}
                    // // console.log(colorCluster.r,colorCluster.g,colorCluster.b,alpha)
                    //  tempColors.push(colorCluster.r,colorCluster.g,colorCluster.b,alpha)
                }
            }
            //console.log(tempColors)
            // for(var i=0;i<geometrySpline.attributes.position.array.length;i=i+3){
            //     var frame=
                
            // }
            //console.log(tempAlpha)
            //var splineAlpha=new Uint8Array( tempAlpha)
            splineColor=new Float32Array(tempColors)
            //var alphaTex=new THREE.DataTexture(splineAlpha)
            // alphaTex.needsUpdate=true
            // console.log(alphaTex)
            
            geometrySpline.setAttribute('color', new THREE.Float32BufferAttribute( splineColor, 4 ) );
            geometrySpline.attributes.color.itemSize===4
            geometrySpline.setAttribute('color', new THREE.Float32BufferAttribute( splineColor, 4 ) );
            //geometrySpline.setAttribute('alpha', new THREE.Float32BufferAttribute( splineAlpha, 1 ) );
            //console.log(geometrySpline)
            var vertexMaterial = new THREE.MeshBasicMaterial({ transparent: true,vertexColors:true, side:THREE.DoubleSide});//alphaMap:alphaTex,color:colorCluster, vertexAlphas:true,
            var finalObj=new THREE.Mesh(geometrySpline,vertexMaterial)
            //const splineObject = new THREE.Mesh( geometry, material );
            //splineObject.updateMatrix()
            //splineObject.userData={Id:splineData[splineId][2],trajCount:splineData[splineId][0], traj:splineData[splineId][3], originalId:splineId}
            //splineObjects.push(splineObject)
            //overviewScene.add(splineObject)

            //close of the tubes top and bottom
            // var pos=geometrySpline.attributes.position;
            // var startPoints=[]
            // for (var i=0; i<geometrySpline.parameters.radialSegments;i++){
            //     startPoints.push(curve.getPoint(0))
            //     startPoints.push(new THREE.Vector3().fromBufferAttribute(pos,i))
            // }
            // //var pointsStart = new THREE.Points(new THREE.BufferGeometry().setFromPoints(startPoints), new THREE.PointsMaterial({size: 0.25, color: "yellow"}));
            // var startGeometry=new ConvexGeometry(startPoints );
            // var startPointObj=new THREE.Mesh(startGeometry, material);
            // // splineObjects.push(startPointObj)
            // // overviewScene.add(startPointObj)


            // var endPoints=[]
            // for (var i=(geometrySpline.parameters.radialSegments + 1) * geometrySpline.parameters.tubularSegments; i < pos.count; i++){
            //     endPoints.push(curve.getPoint(1))
            //     endPoints.push(new THREE.Vector3().fromBufferAttribute(pos,i))
            // }
            // //var pointsStart = new THREE.Points(new THREE.BufferGeometry().setFromPoints(startPoints), new THREE.PointsMaterial({size: 0.25, color: "yellow"}));
            // var endGeometry=new ConvexGeometry(endPoints );
            // var endPointObj=new THREE.Mesh(endGeometry, material);
            // // splineObjects.push(endPointObj)
            // // overviewScene.add(endPointObj)
            // geometrySpline.deleteAttribute('uv')
            // geometrySpline=geometrySpline.toNonIndexed()
            // var mergedMesh=new THREE.BufferGeometry();
            // //console.log(geometrySpline,startPointObj.geometry,endPointObj.geometry)
            // mergedMesh=BufferGeometryUtils.mergeBufferGeometries([geometrySpline,startPointObj.geometry,endPointObj.geometry],false)
            // // mergedMesh.merge(startPointObj.geometry,startPointObj.matrix)
            // // mergedMesh.merge(endPointObj.geometry,endPointObj.matrix)
            // var finalObj=new THREE.Mesh(mergedMesh,material)
            
            finalObj.userData={Id:splineData[splineId][2],trajCount:splineData[splineId][0], traj:splineData[splineId][3], originalId:splineId}
            splineObjects.push(finalObj)
            overviewScene.add(finalObj)


        }
        


        
    }
    render()

}
function createSlicedSplines(){
    //console.log("trying to build sliced splines")
    for( var i=0;i<splineSliceObjects.length;i++){
        sliceScene.remove(splineSliceObjects[i])
    }
    splineSliceObjects=[]
    if(!sliceSettings.showClusters){
        return
    }
    var clusterIndex=splineLOD_Data.length-volconfig.clusterCount
    //console.log(splineLOD_Data)
    //console.log(splineLOD_Data.length)
    var splineData=splineLOD_Data[clusterIndex]
    //console.log(splineData)
    var maxPointsPerCluster=splineLOD_Data[splineLOD_Data.length-1][0][0]
   
    for( var splineId=0;splineId<splineData.length;splineId++ ){



        var splinePoints=[]
         
        for(var  pointId=0;pointId<splineData[splineId][1].length;pointId=pointId+3){
            var point=splineData[splineId][1]
            splinePoints.push(new THREE.Vector3(((point[pointId]-minX)/(maxX-minX))*xLength,((point[pointId+1]-minY)/(maxY-minY))*yLength,point[pointId+2]))
        }
        //splinePoints[splinePoints.length-1]+=Math.random()*splineId
        //splinePoints[2]-=Math.random()*splineId
        //console.log("called")
        var curve=new THREE.CatmullRomCurve3(splinePoints)

        var splinePoints=[]
         
        for(var  pointId=frame*3;pointId<Math.min((frame+sliceSettings.sliceThickness),zLength)*3;pointId=pointId+3){
            var point=splineData[splineId][1]
            splinePoints.push(new THREE.Vector3(((point[pointId]-minX)/(maxX-minX))*xLength,((point[pointId+1]-minY)/(maxY-minY))*yLength,point[pointId+2]))
        }
        var slicedCurve=new THREE.CatmullRomCurve3(splinePoints)

        
        var hsvColor;
        if(sliceSettings.clusterColorMode=='direction'){hsvColor=mapDirectionToColor(curve.getPoint(1).x-curve.getPoint(0).x,curve.getPoint(1).y-curve.getPoint(0).y,true)}
        if(sliceSettings.clusterColorMode=='size'){hsvColor=hsv2rgb(splineData[splineId][0],1,1)}
        if(sliceSettings.clusterColorMode=='individual'){hsvColor=hsv2rgb(splineId/splineData.length*360,1,1)}
        if(sliceSettings.clusterColorMode=='selection'){
            if(filteredSplines.includes(splineId) ){hsvColor=hsv2rgb(360,1,1)}
            else{hsvColor=hsv2rgb(180,1,1)}
        }
        //console.log(hsvColor)
        //var hsVDirectionColor=
        //var hsvArray=hsv2rgb(splineData[splineId][0],1,1)
        var colorCluster=new THREE.Color(hsvColor[0],hsvColor[1],hsvColor[2])//new THREE.Color(Math.random(),Math.random(),Math.random())
        //console.log(colorRand)
        const material = new THREE.MeshBasicMaterial( { color: colorCluster, transparent:true, opacity:sliceSettings.clusterOpacity} );
        //.log(splineVertices[splineId])
        //.log(frame,volconfig.sliceThickness)
        
        //console.log(splineVertices)
        //console.log(tempVertices)
        if(sliceSettings.clusterShape=='convexHull'){
            var tempVertices=splineVertices[splineId].slice(frame,frame+Math.max(sliceSettings.sliceThickness,2))
            var splineGeometry=new ConvexGeometry(tempVertices.flat(1) );
            var SplineMesh=new THREE.Mesh(splineGeometry, material);
            SplineMesh.userData={Id:splineData[splineId][2],trajCount:splineData[splineId][0], traj:splineData[splineId][3], originalId:splineId}
            splineSliceObjects.push(SplineMesh)
            sliceScene.add(SplineMesh)
        }
        if(sliceSettings.clusterShape=='centroid'){

            // Create the tube object to add to the scene
            var splineThickness=Math.sqrt(splineData[splineId][0]/maxPointsPerCluster)*25//Math.sqrt(splineData[splineId][0]/2)Math.sqrt(splineData[splineId][0]/maxPointsPerCluster) //
            const geometry=new THREE.TubeGeometry(slicedCurve,100, splineThickness,8,false)
            const splineObject = new THREE.Mesh( geometry, material );
            splineObject.userData={Id:splineData[splineId][2],trajCount:splineData[splineId][0], traj:splineData[splineId][3], originalId:splineId}
            //splineSliceObjects.push(splineObject)
            //sliceScene.add(splineObject)

            //close of the tubes top and bottom
            var pos=geometry.attributes.position;
            var startPoints=[]
            var startFramePercentage=frame/zLength
            for (var i=0; i<geometry.parameters.radialSegments;i++){
                startPoints.push(curve.getPointAt (startFramePercentage))
                startPoints.push(new THREE.Vector3().fromBufferAttribute(pos,i))
            }
            //var pointsStart = new THREE.Points(new THREE.BufferGeometry().setFromPoints(startPoints), new THREE.PointsMaterial({size: 0.25, color: "yellow"}));
            var startGeometry=new ConvexGeometry(startPoints );
            var startPointObj=new THREE.Mesh(startGeometry, material);
            splineSliceObjects.push(startPointObj)
            sliceScene.add(startPointObj)


            var endPoints=[]
            var endFramePercentage=Math.min(frame+sliceSettings.sliceThickness,zLength)/zLength
            //console.log(endFramePercentage)
            for (var i=(geometry.parameters.radialSegments + 1) * geometry.parameters.tubularSegments; i < pos.count; i++){
                endPoints.push(curve.getPointAt (endFramePercentage))
                endPoints.push(new THREE.Vector3().fromBufferAttribute(pos,i))
            }
            //var pointsStart = new THREE.Points(new THREE.BufferGeometry().setFromPoints(startPoints), new THREE.PointsMaterial({size: 0.25, color: "yellow"}));
            var endGeometry=new ConvexGeometry(endPoints );
            var endPointObj=new THREE.Mesh(endGeometry, material);
            splineSliceObjects.push(endPointObj)
            sliceScene.add(endPointObj)
        }

    }
    render()
    //console.log("creted sliced splines: "+splineSliceObjects )

}
function updateClusterVisuals(){
    var clusterIndex=splineLOD_Data.length-volconfig.clusterCount
    var maxPointsPerCluster=splineLOD_Data[splineLOD_Data.length-1][0][0]
    var splineData=splineLOD_Data[clusterIndex]
    for( var splineId=0;splineId<splineData.length;splineId++ ){



        var splinePoints=[]
        for(var  pointId=0;pointId<splineData[splineId][1].length;pointId=pointId+3){
            var point=splineData[splineId][1]
            splinePoints.push(new THREE.Vector3(((point[pointId]-minX)/(maxX-minX))*xLength,((point[pointId+1]-minY)/(maxY-minY))*yLength,point[pointId+2]))
        }

        var curve=new THREE.CatmullRomCurve3(splinePoints)

        var splineThickness=Math.sqrt(splineData[splineId][0]/maxPointsPerCluster)*25//Math.sqrt(splineData[splineId][0]/2)Math.sqrt(splineData[splineId][0]/maxPointsPerCluster) //
        // const geometry=new THREE.TubeGeometry(curve,100, splineThickness,8,false)
        // var hsvColor;
        // if(volconfig.clusterColorMode=='direction'){hsvColor=mapDirectionToColor(curve.getPoint(1).x-curve.getPoint(0).x,curve.getPoint(1).y-curve.getPoint(0).y,true)}
        // if(volconfig.clusterColorMode=='size'){hsvColor=hsv2rgb(splineData[splineId][0],1,1)}
        // if(volconfig.clusterColorMode=='individual'){hsvColor=hsv2rgb(splineId/splineData.length*360,1,1)}
        // if(volconfig.clusterColorMode=='selection'){
        //     if(filteredSplines.includes(splineId) ){hsvColor=hsv2rgb(360,1,1)}
        //     else{hsvColor=hsv2rgb(180,1,1)}
        // }
        // var colorCluster=new THREE.Color(hsvColor[0],hsvColor[1],hsvColor[2])//new THREE.Color(Math.random(),Math.random(),Math.random())
        // //console.log(colorRand)
        // const material = new THREE.MeshBasicMaterial( { color: colorCluster, transparent:true, opacity:volconfig.clusterOpacity} );
        // splineObjects[splineId].material=material
        //var hsVDirectionColor=
        //var hsvArray=hsv2rgb(splineData[splineId][0],1,1)
        var hsvColorSlice;
        if(sliceSettings.clusterColorMode=='direction'){hsvColorSlice=mapDirectionToColor(curve.getPoint(1).x-curve.getPoint(0).x,curve.getPoint(1).y-curve.getPoint(0).y,true)}
        if(sliceSettings.clusterColorMode=='size'){hsvColorSlice=hsv2rgb(splineData[splineId][0],1,1)}
        if(sliceSettings.clusterColorMode=='individual'){hsvColorSlice=hsv2rgb(splineId/splineData.length*360,1,1)}
        if(sliceSettings.clusterColorMode=='selection'){
            if(filteredSplines.includes(splineId) ){hsvColorSlice=hsv2rgb(360,1,1)}
            else{hsvColorSlice=hsv2rgb(180,1,1)}
        }
        console.log(hsvColorSlice)
        var colorClusterSlice=new THREE.Color(hsvColorSlice[0],hsvColorSlice[1],hsvColorSlice[2])//new THREE.Color(Math.random(),Math.random(),Math.random())
        //console.log(colorRand)
        const materialSlice = new THREE.MeshBasicMaterial( { color: colorClusterSlice, transparent:true, opacity:sliceSettings.clusterOpacity} );
        if(sliceSettings.showClusters)
        {splineSliceObjects[splineId].material=materialSlice}
        
    }
    render()
}

function redrawOverviewScene(){
    overviewScene.remove(particles)
    if(volconfig.showPoints){
        pointCloudGeometry.setAttribute('position',new THREE.BufferAttribute(vertices,3))
        pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );
        pointCloudGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute( opacitys, 1 ) );
        pointCloudMat=new THREE.PointsMaterial({ vertexColors: true,sizeAttenuation:false,size:1})
        particles=new THREE.Points(pointCloudGeometry,customPointShader)
        particles.renderOrder=3
        particles.material.depthTest=false
        overviewScene.add(particles)
    }
    

    overviewScene.remove(lineSegments)
    if(volconfig.showLines){
        bufferLineGeometry=new THREE.BufferGeometry()
        var linePositionAttribute=new THREE.Float32BufferAttribute(vertices,3)
        bufferLineGeometry.setAttribute("position",linePositionAttribute)
        bufferLineGeometry.setIndex(lineIndicesArray.flat(1))
        bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3))
        bufferLineGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute( opacitys, 1 ))
        lineSegments=new THREE.LineSegments(bufferLineGeometry,customLineShader)
        lineSegments.renderOrder=2
        lineSegments.material.depthTest=false;
        overviewScene.add(lineSegments)
    }
    }
    

function createLineSegments(){
    sliceScene.remove(lineSlices)
    //bufferLineSliceGeometry.dispose()
    //lineSlices.material.dispose()
    if(!sliceSettings.showLines){
        return
    }
    
    var linePointSlice=vertices.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
    var lineIndices=lineIndicesArray.slice(frame+1,frame+sliceSettings.sliceThickness)
    
    var colorSlice
    if(sliceSettings.lineColorMode=='individual')
        {colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
    if(sliceSettings.lineColorMode=='direction')
        {colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
    if(sliceSettings.lineColorMode=='cluster')
        {colorSlice=colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}    

    var indexOffset=frameIndicesPoints[frame]/3//dataArray[frame][0][8]
    
    lineIndices=lineIndices.flat(1).map(function(i) {return (i-indexOffset)})
    
    bufferLineSliceGeometry=new THREE.BufferGeometry()
    var linePositionAttribute=new THREE.Float32BufferAttribute(linePointSlice,3)
    //console.log(linePositionAttribute)
    //console.log(lineIndices)
    bufferLineSliceGeometry.setAttribute("position",linePositionAttribute)
    bufferLineSliceGeometry.setIndex(lineIndices)
    bufferLineSliceGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorSlice,3))
    
    //var linesMaterial=new THREE.LineBasicMaterial({ vertexColors:true,transparent:true,opacity:0.2} )
    lineSlices=new THREE.LineSegments(bufferLineSliceGeometry,linesMaterial)
    lineSlices.renderOrder=2
    lineSlices.material.depthTest=false;
    sliceScene.add(lineSlices)

    
}

function createVolumeSlice(){
        sliceScene.remove(denistySlice)

        var upperBound=Math.min (frame+sliceSettings.sliceThickness,zLength-1)
        if(sliceSettings.volumeColorMode=='density'){arraySlice=typedDensityArray.slice(frame*xLength*yLength,upperBound*xLength*yLength)}
        if(sliceSettings.volumeColorMode=='direction'){arraySlice=typedDirectionArray.slice(frame*xLength*yLength,upperBound*xLength*yLength)}
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
        uniformsSlice[ 'u_clim' ].value.set( sliceSettings.clim1, sliceSettings.clim2 );
        uniformsSlice[ 'u_renderstyle' ].value = sliceSettings.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
        uniformsSlice[ 'u_renderthreshold' ].value = sliceSettings.isothreshold; // For ISO renderstyle
        uniformsSlice[ 'u_cmdata' ].value = cmtextures[ sliceSettings.colormap ];

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

function createPointSlice(){
    sliceScene.remove(pointCloudSlice)
    //sliceGeometry.dispose()
    
    var vertexSlice=vertices.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
    //console.log(vertices.length,frameIndicesPoints[frame],frameIndicesPoints[frame+sliceSettings.sliceThickness])
    //console.log(vertexSlice)
    var colorSlice
    if(sliceSettings.pointColorMode=='individual')
        {colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
    if(sliceSettings.pointColorMode=='direction')
        {colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
    if(sliceSettings.pointColorMode=='cluster')
        {colorSlice=colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}    
    var opacitySlice=opacitys.slice(frameIndicesPoints[frame]/3, frameIndicesPoints[frame+sliceSettings.sliceThickness]/3).map(function(x) { return 1; })
    /*console.log(vertexSlice.length)
    console.log(colorSlice.length)
    console.log(opacitySlice.length)
    console.log(opacitySlice.length*3)*/
    sliceGeometry=new THREE.BufferGeometry(); 
    sliceGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(vertexSlice),3))
    sliceGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( new Float32Array(colorSlice), 3 ) );
    sliceGeometry.setAttribute( 'alpha', new THREE.Float32BufferAttribute( new Float32Array(opacitySlice), 3 ) );
    //var sliceGeometry=new THREE.BufferGeometry(); 
    //sliceGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(tempVertices),3))
    pointCloudSlice=new THREE.Points(sliceGeometry,pointCloudMat)
    pointCloudSlice.renderOrder=3
    pointCloudSlice.material.depthTest=false;
    sliceScene.add(pointCloudSlice)
}

function updateSlice(sizeChange){

    createSlicedSplines()
    if(sliceSettings.showVolume){
        if(sizeChange){
            createVolumeSlice()
        }
        else{
            arraySlice.set(typedDensityArray.slice(frame*xLength*yLength, (Math.min(frame+sliceSettings.sliceThickness,zLength))*xLength*yLength))
            textureSlice.dataArray=arraySlice
            textureSlice.needsUpdate=true 
        }
       // arraySlice.set(typedDensityArray.slice(frame*xLength*yLength, (Math.min(frame+volconfig.sliceThickness,zLength))*xLength*yLength))
        //textureSlice.dataArray=arraySlice
        //textureSlice.needsUpdate=true 
        
    }
    

    if(sliceSettings.showPoints){
        if(sizeChange){
            createPointSlice()
        }
        else{
            var vertexSlice=vertices.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
           
            var colorSlice
            if(sliceSettings.pointColorMode=='individual')
                {colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
            if(sliceSettings.pointColorMode=='direction')
                {colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
            if(sliceSettings.pointColorMode=='cluster')
                {colorSlice=colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
            var opacitySlice=opacitys.slice(frameIndicesPoints[frame]/3, frameIndicesPoints[frame+sliceSettings.sliceThickness]/3).map(function(x) { return 1; })
            //sliceGeometry=new THREE.BufferGeometry(); 
            sliceGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(vertexSlice),3))
            //console.log(vertexSlice)
            sliceGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( new Float32Array(colorSlice), 3 ) );
            sliceGeometry.setAttribute( 'alpha', new THREE.Float32BufferAttribute( new Float32Array(opacitySlice), 3 ) );
            //sliceGeometry.attributes.position.needsUpdate=true
            //console.log("trying to Update Point Cloud Pos")
        }
        
        
    }

    if(sliceSettings.showLines){
        if(sizeChange){
            createLineSegments()
        }
        else{
            var linePointSlice=vertices.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
            var lineIndices=lineIndicesArray.slice(frame+1,frame+sliceSettings.sliceThickness)
            
            var colorSlice
                if(sliceSettings.lineColorMode=='individual')
                    {colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
                if(sliceSettings.lineColorMode=='direction')
                    {colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}
                if(sliceSettings.lineColorMode=='cluster')
                    {colorSlice=colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])}    

            var indexOffset=frameIndicesPoints[frame]/3//dataArray[frame][0][8]
            
            lineIndices=lineIndices.flat(1).map(function(i) {return (i-indexOffset)})
            
            //bufferLineSliceGeometry=new THREE.BufferGeometry()
            var linePositionAttribute=new THREE.Float32BufferAttribute(linePointSlice,3)
            //console.log(linePositionAttribute)
            //console.log(lineIndices)
            bufferLineSliceGeometry.setAttribute("position",linePositionAttribute)
            bufferLineSliceGeometry.setIndex(lineIndices)
            bufferLineSliceGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorSlice,3))
        }
    }
   
    
}

function mapDirectionToColor(xVal,yVal,mindIntensity){

    var maxLength=5
    //vector to calculate angle against (should be 1 in length for easier angle calc)
    var x0=1
    var y0=0
    var length=Math.sqrt(xVal*xVal+yVal*yVal)
    
    //compute/set components of hsv color; mapping angle of the vector to the hue
    var angle=Math.asin((xVal*x0+yVal*y0)/length)
            //the angle is retruned in radiants (-PI/2,PI/2), contvert this interval to (0,360) (degrees)
    var hue=((angle+Math.PI/2)/Math.PI)*360
    var saturation=1
    if(mindIntensity){
        //console.log(length)
        saturation=length/maxLength
    }
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

function fullSliceUpdate(){
    
    updateSlice(true)
    updateSliceSettings()
    
}
function onThicknessChange(){
    updateSlice(true)
    sliderUpdate()
    render()
}

function updateSliceSettings(){
    materialSlice.uniforms[ 'u_clim' ].value.set( sliceSettings.clim1, sliceSettings.clim2 );
    materialSlice.uniforms[ 'u_renderstyle' ].value = sliceSettings.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
    materialSlice.uniforms[ 'u_renderthreshold' ].value = sliceSettings.isothreshold; // For ISO renderstyle
    materialSlice.uniforms[ 'u_cmdata' ].value = cmtextures[ sliceSettings.colormap ];

    linesMaterial.opacity=sliceSettings.lineOpacity

    if(sliceSettings.pointColorMode=='individual'){sliceGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness]), 3 ) );}
    if(sliceSettings.pointColorMode=='direction'){sliceGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness]), 3 ) )}
    if(sliceSettings.pointColorMode=='cluster'){sliceGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness]), 3 ) )}

    if(sliceSettings.lineColorMode=='individual'){
        var colorSlice=colorsIndividual.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
        bufferLineSliceGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorSlice,3))  
    }
    if(sliceSettings.lineColorMode=='direction'){
        var colorSlice=colors.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
        bufferLineSliceGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorSlice,3))
    }
    if(sliceSettings.lineColorMode=='cluster'){
        var colorSlice=colorsClusters.slice(frameIndicesPoints[frame], frameIndicesPoints[frame+sliceSettings.sliceThickness])
        bufferLineSliceGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorSlice,3))
    }
    if(sliceSettings.showPoints){sliceScene.add(pointCloudSlice)}
    else{sliceScene.remove(pointCloudSlice)}

    if(sliceSettings.showLines){sliceScene.add(lineSlices)}
    else{sliceScene.remove(lineSlices)}

    if(sliceSettings.showVolume){sliceScene.add(denistySlice)}
    else{sliceScene.remove(denistySlice)}
    render()
}

function syncSettings(){
    if(sliceSettings.syncToOverview){
        sliceSettings.pointColorMode=volconfig.pointColorMode;
        sliceSettings.showPoints=volconfig.showPoints;
        sliceSettings.clim1=volconfig.clim1;
        sliceSettings.clim2=volconfig.clim2;
        sliceSettings.renderstyle=volconfig.renderstyle;
        sliceSettings.isothreshold=volconfig.isothreshold;
        sliceSettings.showLines=volconfig.showLines;
        sliceSettings.lineColorMode=volconfig.lineColorMode;
        sliceSettings.showVolume=volconfig.showVolume;
        sliceSettings.volumeColorMode=volconfig.volumeColorMode;
        sliceSettings.colormap=volconfig.colormap;
        console.log("synced to volume")
        
        for (var i = 0; i < Object.keys(guiSlice.__folders).length; i++) {
            var key = Object.keys(guiSlice.__folders)[i];
            for (var j = 0; j < guiSlice.__folders[key].__controllers.length; j++ )
            {
                guiSlice.__folders[key].__controllers[j].updateDisplay();
            }
        }
        $(lineSettingsSlice.domElement).attr("hidden", true);
        $(volumeSettingsSlice.domElement).attr("hidden", true);
        $(pointSettingsSlice.domElement).attr("hidden", true);
        
    }
    else{
        $(lineSettingsSlice.domElement).attr("hidden", false);
        $(volumeSettingsSlice.domElement).attr("hidden", false);
        $(pointSettingsSlice.domElement).attr("hidden", false);
    }
    
    fullSliceUpdate()
}
    

function sliderUpdate(setZPos){
    if(volconfig.showSlider){
        overviewScene.add(sliderMesh)
        var newGeometry=new THREE.BoxGeometry( xLength, yLength, sliceSettings.sliceThickness);
        sliderMesh.geometry=newGeometry;
        sliderMesh.position.x=xLength/2
        sliderMesh.position.y=yLength/2
        if(setZPos){
            sliderMesh.position.z=frame+sliceSettings.sliceThickness/2
        }
        
        //sliderMesh.position.set(10,100,-zLength/2+frame+volconfig.sliceThickness)
        //sliderMesh.updateMatrix();

        material.uniforms[ 'u_sliderPosMin' ].value = frame;
        material.uniforms[ 'u_sliderPosMax' ].value = frame+sliceSettings.sliceThickness;
        
        //dragControls.enabled=true
        //materialSlice.uniforms[ 'u_sliderPos' ].value = frame;
    }
    else{
        
        material.uniforms[ 'u_sliderPosMin' ].value = -10;
        material.uniforms[ 'u_sliderPosMax' ].value = -10;
        //materialSlice.uniforms[ 'u_sliderPos' ].value = -10;
        overviewScene.remove(sliderMesh)
        //dragControls.enabled=false
    }
    render()
}

function updateUniforms() {

    
    
    //sliderMesh.
    if(volconfig.volumeColorMode=='density'){material.uniforms[ 'u_data' ].value = texture};// texture; //}
    if(volconfig.volumeColorMode=='direction'){material.uniforms[ 'u_data' ].value = directionTexture};// texture; //}
    
    material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 1 : 0; // 0: MIP, 1: ISO
    material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];
    customLineShader.uniforms['u_AlphaMultiplier'].value=volconfig.lineOpacity;
    if(volconfig.pointColorMode=='individual'){pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colorsIndividual, 3 ) );}
    if(volconfig.pointColorMode=='direction'){pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colors, 3 ) );}
    if(volconfig.pointColorMode=='cluster'){pointCloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute( colorsClusters, 3 ) );}

    if(volconfig.lineColorMode=='individual'){bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorsIndividual,3))}
    if(volconfig.lineColorMode=='direction'){bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3))}
    if(volconfig.lineColorMode=='cluster'){bufferLineGeometry.setAttribute("color",new THREE.Float32BufferAttribute(colorsClusters,3))}

    
    
    //material.uniforms['showSlider'].value
    
    if(volconfig.showPoints){overviewScene.add(particles)}
    else{overviewScene.remove(particles)}

    if(volconfig.showLines){overviewScene.add(lineSegments)}
    else{overviewScene.remove(lineSegments)}

    if(volconfig.showVolume){overviewScene.add(densityVolume)}
    else{overviewScene.remove(densityVolume)}
    
    //views[1].camera.far=volconfig.farClippingPlane;
    // console.log(views[1].camera.far)
    // console.log(volconfig.farClippingPlane)
    //updateSlice(false);
    //createSplines();
    //createLineSegments();
    if(sliceSettings.syncToOverview){syncSettings()}
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

function onMouseClick(event){
    event.preventDefault();
    var mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,  -( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );    
    var raycaster =  new THREE.Raycaster();                                        
    raycaster.setFromCamera( mouse3D, cameraOverview ); 
    var intersects = [... new Set(raycaster.intersectObjects( splineObjects ))];
    //console.log(intersects.length)
    var processedSplineIds=[]
    for( var i=0; i<intersects.length;i++){
        //console.log(intersects[i])
        
        intersects[ i ].object.material.color.setHex( 0xff0000 );
        var splineId=intersects[i].object.userData.Id
        if(processedSplineIds.includes(splineId)){continue;}
        if(splineId!=undefined){
            var objData=intersects[i].object.userData
            var objTraj=objData.traj.map(Number)
            console.log("Spline id: "+splineId +", #of traj: "+objData.trajCount+" list length: "+objData.traj.length)
            //console.log("traj in Spline: "+objData.traj)
            if(filteredSplines.includes(splineId)){
                filteredSplines=filteredSplines.filter(val =>val!==splineId)
                filteredTraj=filteredTraj.filter(val=>!objTraj.includes(val))
                //intersects[ i ].object.material.color.setHex( 0x8fce00 );
            }
            else{
                filteredSplines.push(splineId)
                filteredTraj=filteredTraj.concat(objTraj)
                //objTraj+=objData.traj
            }
           
        } 
        processedSplineIds.push(splineId)
    }

    if ( intersects.length > 0 ) {
         console.log(filteredSplines)
         console.log(filteredTraj)
        
        processTrajData()
        fullSliceUpdate()
        redrawOverviewScene()
        createSplines()
        render()
    }
   
   


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


    //stats.update();

}
function animate() {

    requestAnimationFrame( animate );
    render()

}

init();
//animate();