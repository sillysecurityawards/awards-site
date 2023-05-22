import * as THREE from "./three/three.module.min.js";
import { GLTFLoader } from "./three/jsm/loaders/GLTFLoader.js";
import * as CANNON from "./cannon-es.js";
// import CannonDebugger from "./cannon-es-debugger.js";
import Toastify from "./toastify-es.js";

const nominatePhrase = document.getElementById("nominate-phrase");
const nominateButton = document.getElementById("nominate-button");
const nominateClear = document.getElementById("nominate-clear");
const nominateClearButton = nominateClear.querySelector("button");

const nominatePhrases = [
  "What's more illustrious than a company with an award? A company with <em>two</em>&nbsp;awards.",
  "4 out of 5 thought-leaders prefer security partners with at least 3&nbsp;awards.",
  "Just look at all this industry validation. You must be innovating&nbsp;<em>hard</em>.",
];
let nominateCount = 0;
const originalNominatePhrase = nominatePhrase.innerHTML;

const awardPhrases1 = [
  "Best",
  "Leadership in",
  "Achievement in",
  "Innovation in",
  "Team of the Year in",
  "Jury Selection for",
  "Excellence in",
];
const awardPhrases2 = [
  "Cyberstorage",
  "Cybersecurity",
  "Access Management",
  "Endpoint Security",
  "VPN",
  "Email Security",
  "Web Application Security",
  "SaaS Security",
];
const awardPhrases3 = [
  "Vision",
  "Audits",
  "Automation",
  "Research",
  "Orchestration",
  "Pentesting",
  "Science",
  "Ops",
];

const randomArrayItem = (array) =>
  array[Math.floor(Math.random() * array.length)];

const canvas = document.getElementById("three-canvas");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(65);

function repositionCamera() {
  const canvasSize = canvas.getBoundingClientRect();
  const angle = camera.fov / 2;
  const height = 3;

  camera.position.y = height;
  // camera.position.z = Math.tan(((90 - angle) * Math.PI) / 180) * height;
  camera.position.z = Math.tan(((90 - angle) * Math.PI) / 180) * height + 1;
  camera.aspect = canvasSize.width / canvasSize.height;
  camera.updateProjectionMatrix();
}

repositionCamera();
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: canvas,
});
const canvasSize = canvas.getBoundingClientRect();
renderer.setSize(canvasSize.width, canvasSize.height, false);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 0);
camera.updateProjectionMatrix();

window.addEventListener("resize", () => {
  const canvasSize = canvas.getBoundingClientRect();
  renderer.setSize(canvasSize.width, canvasSize.height, false);
  repositionCamera();
});

// Light
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 0, 10);
scene.add(light);

// Set up physics
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
// const cannonDebugger = new CannonDebugger(scene, world);

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
    camera.position.y * 2 + 1, // A bit of a hack but it's the value we want
    0
  );

  function spawnObject() {
    if (objects.length >= maxObjects) {
      const obj = objects.shift();

      obj.body.position = new CANNON.Vec3(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z
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
        initialPosition.z
      ),
    });

    const obj = new THREE.Object3D();

    for (const node of nodes) {
      const size = node.geometry.boundingBox.getSize(new THREE.Vector3());
      const shape = new CANNON.Box(new CANNON.Vec3().copy(size).scale(0.5));

      const { center } = node.geometry.boundingSphere;

      body.addShape(
        shape,
        new CANNON.Vec3(
          center.x + node.position.x,
          center.y + node.position.y,
          center.z + node.position.z
        ),
        node.quaternion
      );

      obj.add(node.clone());
    }

    const rotation = new THREE.Quaternion().random();
    body.quaternion = new CANNON.Quaternion(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    obj.body = body;

    world.addBody(body);
    scene.add(obj);
    objects.push(obj);
  }

  let showClearTimeout;

  function nominate() {
    spawnObject();

    const awardName = [awardPhrases1, awardPhrases2, awardPhrases3]
      .map(randomArrayItem)
      .join(" ");

    Toastify({
      text: `You won 🏆 ${awardName}`,
      position: "right",
      duration: 5000,
      style: {
        background: "rgb(237 232 255 / 95%)",
      },
    }).showToast();

    if (objects.length) {
      clearTimeout(showClearTimeout);
      showClearTimeout = setTimeout(() => {
        nominateClear.classList.add("is-shown");
      }, 2500);
    }

    nominatePhrase.innerHTML =
      nominatePhrases[Math.min(nominateCount, nominatePhrases.length - 1)];
    nominateCount++;
  }

  let isClearing = false;
  function clear() {
    if (isClearing) return;
    isClearing = true;

    const force = 100;

    for (const obj of objects) {
      const direction = obj.body.position.clone();
      direction.normalize();
      direction.y = Math.random();
      obj.body.angularVelocity.set(10, 10, 10);
      obj.body.applyImpulse(direction.scale(force));
    }

    setTimeout(() => {
      while (objects.length > 0) {
        const obj = objects.pop();
        world.removeBody(obj.body);
        scene.remove(obj);
      }
      isClearing = false;
    }, 1000);

    nominateClear.classList.remove("is-shown");
    clearTimeout(showClearTimeout);

    nominateCount = 0;
    nominatePhrase.innerHTML = originalNominatePhrase;
  }

  nominateButton.addEventListener("click", nominate);
  nominateClearButton.addEventListener("click", clear);

  const draw = () => {
    // cannonDebugger.update();

    for (const obj of objects) {
      obj.position.copy(obj.body.position);
      obj.quaternion.copy(obj.body.quaternion);
    }

    world.fixedStep();
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(draw);
});
