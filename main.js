import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.154/examples/jsm/webxr/VRButton.js';

let scene, camera, renderer, ball;
let time = 0, mode = 0;
let speed = 0.005;
let currentTextureIndex = 0;
let textures = [];
let lastTap = 0;
let tapTimeout;
let touchStartX = 0;
let touchEndX = 0;
let isSwipe = false;
let const_time = Date.now();
const SWIPE_THRESHOLD = 30;

let isVRSessionActive = false;
let vrControllerStartPosition = null;
const VR_SWIPE_THRESHOLD = 0.1;

function handleTap() {
    const now = Date.now();
    const doubleTapTime = 300;

    if (now - lastTap < doubleTapTime) {
        clearTimeout(tapTimeout);
        mode = (mode + 1) % 6;
        console.log("Сменился режим движения:", mode);
    } else {
        tapTimeout = setTimeout(() => {
            changeSkybox();
        }, doubleTapTime);
    }
    
    lastTap = now;
}
function handleSwipe() {
    if (speed>=0.020){
        speed = 0.005;
    } else{
        speed+=0.005;
    }
   
    console.log("Скорость изменена:", speed);
}
// function handleSwipe(direction) {
//     if (direction === 'right') {
//         speed = Math.min(speed + 0.05, 5);
//     } else {
//         speed = Math.max(speed - 0.05, 0.001);
//     }
//     console.log("Скорость изменена:", speed);
// }

function handleTouchStart(event) {
    if (isVRSessionActive) return;
    touchStartX = event.touches[0].clientX;
    isSwipe = false;
    event.preventDefault();
}

function handleTouchMove(event) {
    
    if (isVRSessionActive) return;
    touchEndX = event.touches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        isSwipe = true;
    }
}

function handleTouchEnd(event) {
    if (isVRSessionActive) return;

    if (!isSwipe) {
        handleTap();
        return;
    }

    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        handleSwipe(deltaX > 0 ? 'right' : 'left');
    }
}

function changeSkybox() {
    currentTextureIndex = (currentTextureIndex + 1) % textures.length;
    loadSkybox(textures[currentTextureIndex]);
}

function createPathStrings(filename) {
    const basePath = "./static/";
    const baseFilename = basePath + filename;
    const fileType = ".jpg";
    const sides = ["rt", "lf", "up", "dn", "bk", "ft"];
    return sides.map(side => baseFilename + "_" + side + fileType);
}

function loadSkybox(texture) {
    scene.background = texture;
    console.log("Skybox изменен");
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.domElement.style.touchAction = 'none';
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    ball = new THREE.Mesh(geometry, material);
    camera.add(ball);
    ball.position.set(0, 0, -5);
    scene.add(camera);

    const controller = renderer.xr.getController(0);
    scene.add(controller);

    const loader = new THREE.CubeTextureLoader();
    textures = [
        loader.load(createPathStrings("cloudy/browncloud")),
        loader.load(createPathStrings("gray/graycloud")),
        loader.load(createPathStrings("mountain/mountain")),
        loader.load(createPathStrings("water_scene/water")),
    ];
    loadSkybox(textures[currentTextureIndex]);

    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    renderer.domElement.addEventListener('touchend', handleTouchEnd);
    renderer.domElement.addEventListener('click', handleTap);


    

    renderer.xr.addEventListener('sessionstart', () => {

        isVRSessionActive = true;
        let now1 = 0;
        
        const controller = renderer.xr.getController(0);
        
        controller.addEventListener('selectstart', () => {
            vrControllerStartPosition = controller.position.clone();
            now1 = performance.now();
            console.log('pressed', now1)
            controller.addEventListener('selectend', () => {
                if (!vrControllerStartPosition) return;
                
                let now2 = performance.now();
                console.log('unpressed', now2)
                let res = now2-now1;
                console.log(res);
                const deltaX = controller.position.x - vrControllerStartPosition.x;
                if (res>100) {
                    handleSwipe()
                } else {
                    handleTap();
                    }
    
                vrControllerStartPosition = null;
            });
        });
        
    });

    renderer.xr.addEventListener('sessionend', () => {
        isVRSessionActive = false;
    });

    animate();
}

function animate() {
    time += speed;
    if (time > 10){
        if (mode===4){
            time=.56;
        } else if (mode===5){
            time=0.56;
        } else{
            time=1;
        }
    };

    switch (mode) {
        case 0:
            ball.position.x = Math.sin(time * 2) * 2.7;
            ball.position.y = 0.5;
            break;
        case 1:
            ball.position.y = Math.sin(time * 2) * 3 + 0.5;
            ball.position.x = 0;
            break;
        case 2:
            ball.position.x = Math.sin(time * 2) * 3;
            ball.position.y = Math.sin(time * 2) * 3 + 0.5;
            break;
        case 3:
            ball.position.x = Math.sin(time * 2) * 3;
            ball.position.y = -Math.sin(time * 2) * 3 + 0.5;
            break;
        case 4:
            ball.position.x = Math.sin(time * 2) * 3;
            ball.position.y = Math.cos(time * 2) * 3 ;
            break;
        case 5:
            ball.position.x = 3*Math.cos(time * 2);
            ball.position.y = 1.7*Math.cos(time * 4+3.1415/2); // add pi value
            break;
    }

    renderer.setAnimationLoop(animate);
    renderer.render(scene, camera);
}

init();

