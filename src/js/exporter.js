import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

export class Exporter {
  exportScene(scene) {
    function save(blob, filename) {
      const link = document.createElement("a");
      link.style.display = "none";
      document.body.appendChild(link);
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }

    function saveString(text, filename) {
      save(new Blob([text], { type: "text/plain" }), filename);
    }

    function saveArrayBuffer(buffer, filename) {
      save(new Blob([buffer], { type: "application/octet-stream" }), filename);
    }
    const gltfExporter = new GLTFExporter();

    gltfExporter.parse(
      scene,
      function (result) {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, "scene.glb");
        } else {
          const output = JSON.stringify(result, null, 2);
          saveString(output, "scene.gltf");
        }
      },
      function (error) {
        console.log("An error happened during parsing", error);
      }
    );
  }
}
