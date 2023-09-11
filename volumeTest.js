
import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from './js/three.module.js'//'https://unpkg.com/three@0.127.0/build/three.module.js';
//import Stats from './js/stats.min.js';
import { GUI } from 'https://unpkg.com/three@0.127.0/examples/jsm/libs/dat.gui.module.js';

import { NRRDLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/NRRDLoader.js';
import { VolumeRenderShader1 } from 'https://unpkg.com/three@0.127.0/examples/jsm/shaders/VolumeShader.js';
//import WebGL from 'three/addons/capabilities/WebGL.js';

/*if ( WebGL.isWebGL2Available() === false ) {

    document.body.appendChild( WebGL.getWebGL2ErrorMessage() );

}*/
const stats = new Stats()
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0';
stats.domElement.style.top = '0';
document.body.appendChild( stats.domElement );

let renderer,
    scene,
    camera,
    controls,
    material,
    volconfig,
    cmtextures;

init();

function init() {

    scene = new THREE.Scene();

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    // Create camera (The volume renderer does not work very well with perspective yet)
    const h = 512; // frustum height
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera( - h * aspect / 2, h * aspect / 2, h / 2, - h / 2, 1, 1000 );
    camera.position.set( - 64, - 64, 128 );
    camera.up.set( 0, 0, 1 ); // In our data, z is up
    
    // Create controls
    controls = new OrbitControls( camera, renderer.domElement );
    controls.addEventListener( 'change', render );
    //controls.target.set( 64, 64, 128 );
    //controls.minZoom = 0.5;
    //controls.maxZoom = 4;
    //controls.enablePan = false;
    controls.update();

    // scene.add( new AxesHelper( 128 ) );

    // Lighting is baked into the shader a.t.m.
    // let dirLight = new DirectionalLight( 0xffffff );

    // The gui for interaction
    volconfig = { clim1: 0, clim2: 1, renderstyle: 'iso', isothreshold: 0.15, colormap: 'viridis' };
    const gui = new GUI();
    gui.add( volconfig, 'clim1', 0, 1, 0.01 ).onChange( updateUniforms );
    gui.add( volconfig, 'clim2', 0, 1, 0.01 ).onChange( updateUniforms );
    gui.add( volconfig, 'colormap', { gray: 'gray', viridis: 'viridis' } ).onChange( updateUniforms );
    gui.add( volconfig, 'renderstyle', { mip: 'mip', iso: 'iso' } ).onChange( updateUniforms );
    gui.add( volconfig, 'isothreshold', 0, 1, 0.01 ).onChange( updateUniforms );

    // Load the data ...
    //new NRRDLoader().load( 'stent.nrrd', function ( volume ) {

        // Texture to hold the volume. We have scalars, so we put our data in the red channel.
        // THREEJS will select R32F (33326) based on the THREE.RedFormat and THREE.FloatType.
        // Also see https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
        // TODO: look the dtype up in the volume metadata
        
        /*const xLength=volume.xLength;
        const yLength=volume.yLength;
        const zLength=volume.zLength;*/


        const xLength=150;
        const yLength=150;
        const zLength=1500;
        
        const typedArray1 = new Float32Array(xLength*yLength*zLength);
        for (let i=0;i<typedArray1.length;i++){
            typedArray1[i]=Math.random();//i/typedArray1.length;
        }
        
        //const dataTest=[1,1,1,1,0,0,0,0,0.5,0.5,0.5,0.5,0,0,0,0]
        //const texture = new THREE.Data3DTexture( volume.data, volume.xLength, volume.yLength, volume.zLength ); //volume.data is a 1D array containing values between 0 and 1
        const texture = new THREE.Data3DTexture( typedArray1, xLength, yLength, zLength);
        //edit: the data  actually has exactly xLength*yLength*zLength entries
        //console.log(volume.data)
        //console.log(volume.xLength)
        //console.log(volume.yLength)
        //console.log(volume.zLength)
        //console.log(volume.data);
        texture.format = THREE.RedFormat;
        texture.type = THREE.FloatType;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        texture.unpackAlignment = 1;
        texture.needsUpdate = true;

        // Colormap textures
        cmtextures = {
            viridis: new THREE.TextureLoader().load( 'cm_viridis.png', render ),
            gray: new THREE.TextureLoader().load( 'cm_gray.png', render )
        };

        // Material
        const shader = VolumeRenderShader1;

        const uniforms = THREE.UniformsUtils.clone( shader.uniforms );

        uniforms[ 'u_data' ].value = texture;
        uniforms[ 'u_size' ].value.set( xLength, yLength, zLength);
        uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
        uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
        uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
        uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

        material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.BackSide // The volume shader uses the backface as its "reference point"
        } );

        // THREE.Mesh
        const geometry = new THREE.BoxGeometry( xLength, yLength, zLength );
        geometry.translate( xLength / 2 - 0.5, yLength / 2 - 0.5, zLength / 2 - 0.5 );

        const mesh = new THREE.Mesh( geometry, material );
        scene.add( mesh );

        render();

    //} );

    window.addEventListener( 'resize', onWindowResize );

}

function updateUniforms() {

    
    material.uniforms[ 'u_clim' ].value.set( volconfig.clim1, volconfig.clim2 );
    material.uniforms[ 'u_renderstyle' ].value = volconfig.renderstyle == 'mip' ? 0 : 1; // 0: MIP, 1: ISO
    material.uniforms[ 'u_renderthreshold' ].value = volconfig.isothreshold; // For ISO renderstyle
    material.uniforms[ 'u_cmdata' ].value = cmtextures[ volconfig.colormap ];

    render();
    

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );

    const aspect = window.innerWidth / window.innerHeight;

    const frustumHeight = camera.top - camera.bottom;

    camera.left = - frustumHeight * aspect / 2;
    camera.right = frustumHeight * aspect / 2;

    camera.updateProjectionMatrix();

    render();

}

function render() {

    renderer.render( scene, camera );
    stats.update();

}

