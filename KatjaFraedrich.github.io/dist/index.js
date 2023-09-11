import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';


// Scene
const scene = new THREE.Scene()
scene.background=0xff0000
const width = window.innerWidth;
const height = window.innerHeight;

window.addEventListener('resize', () => {
    onWindowResize(); // your function?
    });
// Renderer
const renderer = new THREE.WebGLRenderer(
    //{
    //canvas: document.querySelector('canvas.webgl'),
    //alpha:true
    //}
)
renderer.setSize(width, height);

document.body.appendChild( renderer.domElement );


// Camera
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500);
camera.position.z = 30
scene.add(camera)


const clock=new THREE.Clock()
//Parameters that can be modified.


//renderer.setClearColor( 0x000000, 0 ); // 

const controls = new OrbitControls( camera, renderer.domElement );





// Object
const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
geometry.doubleSided = true;
const newMaterial= new THREE.MeshStandardMaterial({ color: 0xff0000 ,wireframe:true})
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const uniformData={
    u_time:{type:'f', value: clock.getElapsedTime(),}
}

const shaderMat=new THREE.ShaderMaterial({
    //wireframe:true,
    uniforms: uniformData,   //uniform data can be manipulated from the outside (e.g. a time or other global settings)
                            //vaying data is passed from the vertexshader to the fragmentshader (e.g. the position or computed vars)
    vertexShader: `         
    varying vec3 pos;
    uniform float u_time;

    void main() {
        vec4 result;
        pos=position;
        result=vec4(position.x,4.0*sin(position.z/4.0+u_time)+position.y,position.z,1.0);
        gl_Position=projectionMatrix * modelViewMatrix * result;
    }`,
    fragmentShader: `
    varying vec3 pos;
    void main() {
        if(pos.x>=0.0){
            gl_FragColor=vec4(1.0,0.0,0.0,1.0);
        } 
        else{
            gl_FragColor=vec4(0.0,1.0,0.0,1.0);
        }
        
    }`
})
const mesh = new THREE.Mesh(geometry, shaderMat)
scene.add(mesh)













renderer.render(scene, camera)

/**
 * Animate
 */
let time = Date.now()

const tick = () =>
{

    // Time
    const currentTime = Date.now()
    const deltaTime = currentTime - time
    time = currentTime
    uniformData.u_time.value=clock.getElapsedTime();
    // Update objects
    //mesh.rotation.y += 0.0001 * deltaTime
    controls.update();
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}



