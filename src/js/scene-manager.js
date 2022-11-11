import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { Exporter } from "./exporter";

export class SceneManager {
  createScene(object) {
    const dropzone = document.querySelector("#dropzone");
    dropzone.style.display = "none";

    const mode = document.querySelector("#mode");
    const trasformMode = "Transform";
    const orbitMode = "Orbit";
    mode.textContent = trasformMode;

    //create scene
    const scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(5));

    //create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;
    camera.position.y = 5;
    camera.position.x = 3;

    //create renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.setClearColor(0xffffff, 1);

    //create lights
    const light = new THREE.HemisphereLight(0x404040, 0xffffff, 1.2);
    scene.add(light);

    //create controls
    const controls = new TransformControls(camera, renderer.domElement);
    scene.add(controls);

    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enabled = false;

    //create floor plane
    const geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotateX(-Math.PI / 2);

    scene.add(plane);

    //reset object position
    this.resetPosition(object);

    //-------------------------------------------------------------
    //KEYCODES FOR CONTROLS
    //2 MODES:
    //-transform:
    //  G -> TRANSLATE
    //  R -> ROTATE
    //-orbit:
    //  LeftMouse -> orbit camera
    //  MiddleMouse -> zoom in/out
    //
    //PRESS 'Q' TO SWITCH BETWEEN MODES
    window.addEventListener("keydown", function (event) {
      switch (event.code) {
        case "KeyG":
          controls.setMode("translate");
          break;
        case "KeyR":
          controls.setMode("rotate");
          break;
        case "KeyQ":
          switchControls();
          break;
      }
    });

    let MODES = { ORBIT: 0, TRANSFORM: 1 };
    let currMode = 1;

    function switchControls() {
      switch (currMode) {
        case MODES.ORBIT:
          orbit.enabled = false;
          controls.enabled = true;
          currMode = MODES.TRANSFORM;
          mode.textContent = trasformMode;
          break;

        case MODES.TRANSFORM:
          orbit.enabled = true;
          controls.enabled = false;
          currMode = MODES.ORBIT;
          mode.textContent = orbitMode;
          break;
      }
    }
    //-------------------------------------------------------------

    function animate() {
      requestAnimationFrame(animate);
      render();
    }

    function render() {
      renderer.render(scene, camera);
    }

    animate();

    //set export button when scene is loaded
    const exporter = new Exporter();

    const exportButton = document.querySelector("#export");
    exportButton.style.display = "inline";
    exportButton.onclick = () => {
      exporter.exportScene(object);
    };

    const helper = document.querySelector("#helper");
    helper.style.display = "inline";

    return [scene, controls];
  }

  resetPosition(object) {
    object.position.set(0, 0, 0);
    const yDiff =
      object.geometry?.boundingBox.min.y ||
      object.children[0]?.geometry.boundingBox.min.y;
    object.position.set(0, -yDiff, 0);
  }
}
