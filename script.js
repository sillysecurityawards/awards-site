import * as THREE from "./three/three.module.min.js";
import { GLTFLoader } from "./three/jsm/loaders/GLTFLoader.js";
import * as CANNON from "./cannon-es.js";
import CannonDebugger from "./cannon-es-debugger.js";

const canvas = document.getElementById("three-canvas");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(65);

function repositionCamera() {
  const canvasSize = canvas.getBoundingClientRect();
  const angle = camera.fov / 2
  const height = 3

  camera.position.y = height
  camera.position.z = Math.tan((90 - angle) * Math.PI / 180) * height
  camera.aspect = canvasSize.width / canvasSize.height
  camera.updateProjectionMatrix();
}

repositionCamera();
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});
const canvasSize = canvas.getBoundingClientRect();
renderer.setSize(canvasSize.width, canvasSize.height, false);
renderer.setPixelRatio(window.devicePixelRatio);
camera.updateProjectionMatrix();

window.addEventListener("resize", () => {
  const canvasSize = canvas.getBoundingClientRect();
  renderer.setSize(canvasSize.width, canvasSize.height, false);
  repositionCamera();
})

// Light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 0, 10);
scene.add(light);

// Set up physics
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
const cannonDebugger = new CannonDebugger(scene, world);

// Static ground plane
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.position.set(0, 0, 0);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

// Instantiate a loader
const loader = new GLTFLoader();
loader.load("./trophy.glb", function (model) {
  const nodes = model.scene.children;
  const objects = [];
  const maxObjects = 50;
  const initialPosition = new THREE.Vector3(
    0,
    camera.position.y * 2 + 0.5, // A bit of a hack but it's the value we want
    0
  );
  let isFirst = true;

  function spawnObject() {
    if (objects.length >= maxObjects) {
      const obj = objects.shift();

      obj.body.position = new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      );
      obj.body.angularVelocity = new CANNON.Vec3(0, 0, 0);
      obj.body.velocity = new CANNON.Vec3(0, 0, 0);

      objects.push(obj);

      return;
    }

    const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      ),
    });

    const obj = new THREE.Object3D();

    for (const node of nodes) {
      const size = node.geometry.boundingBox.getSize(new THREE.Vector3());
      const shape = new CANNON.Box(new CANNON.Vec3().copy(size).scale(0.5))

      const { center } = node.geometry.boundingSphere;

      body.addShape(
        shape,
        new CANNON.Vec3(
          center.x + node.position.x,
          center.y + node.position.y,
          center.z + node.position.z,
        ),
        node.quaternion,
      )

      obj.add(node.clone());
    }

    if (!isFirst) {
      const rotation = new THREE.Quaternion().random();
      body.quaternion = new CANNON.Quaternion(
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w,
      );
    }

    isFirst = false;

    obj.body = body;

    world.addBody(body);
    scene.add(obj);
    objects.push(obj);
  }

  spawnObject();
  document.querySelector(".nominate__button").addEventListener("click", spawnObject);

  const draw = () => {
    cannonDebugger.update();

    for (const obj of objects) {
      obj.position.copy(obj.body.position);
      obj.quaternion.copy(obj.body.quaternion);
    }

    world.fixedStep();
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(() => draw());
});
