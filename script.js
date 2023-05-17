import * as THREE from "./three/three.module.min.js";
import { GLTFLoader } from "./three/jsm/loaders/GLTFLoader.js";
import * as CANNON from "./cannon-es.js";
import CannonDebugger from "./cannon-es-debugger.js";

const canvas = document.getElementById("three-canvas");
const canvasSize = canvas.getBoundingClientRect();

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  canvasSize.width / canvasSize.height
);
// camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});
renderer.setSize(canvasSize.width, canvasSize.height, false);
renderer.setPixelRatio(window.devicePixelRatio);

// Light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 0, 10);
scene.add(light);

// Set up physics
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
const cannonDebugger = new CannonDebugger(scene, world);

// Instantiate a loader
const loader = new GLTFLoader();
loader.load("./trophy.glb", function (model) {
  const nodes = model.scene.children[0].children;

  const meshes = [];

  // The two nodes are the gold cup and the brown base (need to group these together)
  for (const node of nodes) {
    node.geometry.computeBoundingBox();
    node.geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(node.geometry, node.material);

    // Get size of our entire mesh
    mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3());

    // Note that we need to scale down our geometry because of Box's Cannon.js class setup
    const box = new CANNON.Box(new CANNON.Vec3().copy(mesh.size).scale(0.5));

    // Attach the body directly to the mesh
    mesh.body = new CANNON.Body({
      mass: 1, // kg
      position: new CANNON.Vec3(0, 0, 0), // m
    });

    // Add the shape to the body and offset it to match the center of our mesh
    const { center } = mesh.geometry.boundingSphere;
    mesh.body.addShape(box, new CANNON.Vec3(center.x, center.y, center.z));

    mesh.body.angularVelocity.set(0, 10, 0);
    mesh.body.angularDamping = 0.5;

    // Add the body to our world
    world.addBody(mesh.body);

    meshes.push(mesh);
    scene.add(mesh);
  }

  // Static ground plane
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.position.set(0, 0, 0);
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  const draw = () => {
    cannonDebugger.update();

    for (const mesh of meshes) {
      mesh.position.copy(mesh.body.position);
      mesh.quaternion.copy(mesh.body.quaternion);
    }

    world.fixedStep();
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(() => draw());
});
