import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.154/examples/jsm/webxr/VRButton.js';

let scene, camera, renderer, ball;
let time = 0, mode = 0;
let speed = 0.005;
let textures = [];
let lastTap = 0;
const SWIPE_THRESHOLD = 30;
let isVRSessionActive = false;
let vrControllerStartPosition = null;

function handleTap() {
    const now = Date.now();
    if (now - lastTap < 300) {
        mode = (mode + 1) % 6;
        console.log("Сменился режим движения:", mode);
    } else {
        setTimeout(changeSkybox, 300);
    }
    lastTap = now;
}

function handleSwipe() {
    speed = (speed >= 0.020) ? 0.005 : speed + 0.005;
    console.log("Скорость изменена:", speed);
}

function createPathStrings(filename) {
    const basePath = "./textures/";
    const sides = ["rt", "lf", "up", "dn", "bk", "ft"];
    return sides.map(side => `${basePath}${filename}_${side}.jpg`);
}

function loadSkybox(texture) {
    scene.background = texture;
    console.log("Skybox изменен");
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
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

    const loader = new THREE.CubeTextureLoader();
    textures = [
        loader.load(createPathStrings("cloudy/browncloud")),
        loader.load(createPathStrings("gray/graycloud")),
        loader.load(createPathStrings("mountain/mountain")),
        loader.load(createPathStrings("water_scene/water")),
    ];
    loadSkybox(textures[0]);

    renderer.domElement.addEventListener('click', handleTap);
    renderer.xr.addEventListener('sessionstart', () => isVRSessionActive = true);
    renderer.xr.addEventListener('sessionend', () => isVRSessionActive = false);

    animate();
}

function animate() {
    time += speed;
    if (time > 10) time = (mode >= 4) ? 0.56 : 1;

    switch (mode) {
        case 0: ball.position.set(Math.sin(time * 2) * 2.7, 0.5, -5); break;
        case 1: ball.position.set(0, Math.sin(time * 2) * 3 + 0.5, -5); break;
        case 2: ball.position.set(Math.sin(time * 2) * 3, Math.sin(time * 2) * 3 + 0.5, -5); break;
        case 3: ball.position.set(Math.sin(time * 2) * 3, -Math.sin(time * 2) * 3 + 0.5, -5); break;
        case 4: ball.position.set(Math.sin(time * 2) * 3, Math.cos(time * 2) * 3, -5); break;
        case 5: ball.position.set(3 * Math.cos(time * 2), 1.7 * Math.cos(time * 4 + Math.PI / 2), -5); break;
    }

    renderer.setAnimationLoop(animate);
    renderer.render(scene, camera);
}

init();
