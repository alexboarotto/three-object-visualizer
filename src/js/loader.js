import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { LoaderUtils, LoadingManager, Scene } from "three";
import { SceneManager } from "./scene-manager";

const MANAGER = new LoadingManager();

export class Loader {
  constructor() {
    this.FILETYPES = { GLB: 0, OBJ: 1, FBX: 2 };
    this.filetype = this.FILETYPES.GLB;
  }

  load(fileMap) {
    let rootFile;
    let rootPath;
    Array.from(fileMap).forEach(([path, file]) => {
      if (file.name.match(/\.(gltf|glb)$/)) {
        rootFile = file;
        rootPath = path.replace(file.name, "");
        this.filetype = this.FILETYPES.GLB;
      }
      if (file.name.match(/\.(obj|mtl|png)$/)) {
        rootFile = file;
        rootPath = path.replace(file.name, "");
        this.filetype = this.FILETYPES.OBJ;
      }
      if (file.name.match(/\.(fbx)$/)) {
        rootFile = file;
        rootPath = path.replace(file.name, "");
        this.filetype = this.FILETYPES.FBX;
      }
    });
    this.view(rootFile, rootPath, fileMap);
  }

  view(rootFile, rootPath, fileMap) {
    const fileURL =
      typeof rootFile === "string" ? rootFile : URL.createObjectURL(rootFile);

    switch (this.filetype) {
      case this.FILETYPES.GLB:
        this.loadGLB(fileURL, rootPath, fileMap);
        break;
      case this.FILETYPES.FBX:
        this.loadFBX(fileURL, rootPath, fileMap);
        break;
      case this.FILETYPES.OBJ:
        this.loadOBJ(fileURL, rootPath, fileMap);
        break;
    }
  }

  loadGLB(url, rootPath, assetMap) {
    const baseURL = LoaderUtils.extractUrlBase(url);

    // Load.
    return new Promise((resolve, reject) => {
      // Intercept and override relative URLs.
      MANAGER.setURLModifier((url, path) => {
        const normalizedURL =
          rootPath +
          decodeURI(url)
            .replace(baseURL, "")
            .replace(/^(\.?\/)/, "");

        if (assetMap.has(normalizedURL)) {
          const blob = assetMap.get(normalizedURL);
          const blobURL = URL.createObjectURL(blob);
          blobURLs.push(blobURL);
          return blobURL;
        }

        return (path || "") + url;
      });

      const loader = new GLTFLoader(MANAGER);

      const blobURLs = [];

      loader.load(
        url,
        (gltf) => {
          const objects = gltf.scene || gltf.scenes[0];
          const clips = gltf.animations || [];
          const sceneManager = new SceneManager();

          const [scene, controls] = sceneManager.createScene(
            objects.children[0]
          );

          if (!objects) {
            // Valid, but not supported by this viewer.
            throw new Error(
              "This model contains no scene, and cannot be viewed here. However," +
                " it may contain individual 3D resources."
            );
          }

          scene.add(objects);
          controls.attach(objects);

          blobURLs.forEach(URL.revokeObjectURL);

          resolve(gltf);
        },
        undefined,
        reject
      );
    });
  }

  loadFBX(url, rootPath, assetMap) {
    const baseURL = LoaderUtils.extractUrlBase(url);

    // Load.
    return new Promise((resolve, reject) => {
      // Intercept and override relative URLs.
      MANAGER.setURLModifier((url, path) => {
        const normalizedURL =
          rootPath +
          decodeURI(url)
            .replace(baseURL, "")
            .replace(/^(\.?\/)/, "");

        if (assetMap.has(normalizedURL)) {
          const blob = assetMap.get(normalizedURL);
          const blobURL = URL.createObjectURL(blob);
          blobURLs.push(blobURL);
          return blobURL;
        }

        return (path || "") + url;
      });

      const loader = new FBXLoader(MANAGER);

      const blobURLs = [];

      loader.load(
        url,
        (object) => {
          object.traverse(function (child) {
            if (child.isMesh) {
              if (child.material) {
                child.material.transparent = false;
              }
            }
          });
          object.scale.set(0.01, 0.01, 0.01);
          const sceneManager = new SceneManager();
          const [scene, controls] = sceneManager.createScene(object);
          scene.add(object);
          controls.attach(object);

          blobURLs.forEach(URL.revokeObjectURL);

          resolve(fbx);
        },
        undefined,
        reject
      );
    });
  }

  loadOBJ(url, rootPath, assetMap) {}
}
