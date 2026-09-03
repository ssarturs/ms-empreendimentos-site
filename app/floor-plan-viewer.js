"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function FloorPlanViewer() {
  const host = useRef(null);
  const actions = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState("perspective");
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    const container = host.current;
    let stopped = false;
    let renderer, controls, resizeObserver, visibilityObserver, model;
    let visible = true;
    let needsRender = true;
    const scene = new THREE.Scene();
    const abort = new AbortController();
    setReady(false);
    setError(false);
    setRotating(false);
    setView("perspective");

    async function setup() {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .90;
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute("aria-label", "Maquete 3D da Planta 03. Arraste para girar; use os botões para mudar a vista e aproximar.");
        container.appendChild(renderer.domElement);
        renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          if (!stopped) { setReady(false); setError(true); }
        });

        const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, .1, 150);
        camera.position.set(18, 26, 14);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, .65, 0);
        controls.enableDamping = true;
        controls.dampingFactor = .09;
        controls.enablePan = false;
        controls.minPolarAngle = .005;
        controls.maxPolarAngle = Math.PI * .44;
        controls.minZoom = .55;
        controls.maxZoom = 4;
        controls.autoRotateSpeed = .85;
        controls.update();

        scene.add(new THREE.HemisphereLight("#fffaee", "#b7bcaf", 1.8));
        const sun = new THREE.DirectionalLight("#fff4df", 2.5);
        sun.position.set(-7, 19, 9);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: .5, far: 55 });
        sun.shadow.normalBias = .025;
        sun.shadow.bias = -.00015;
        scene.add(sun);
        const fill = new THREE.DirectionalLight("#e9f1f5", .8);
        fill.position.set(10, 12, -9);
        scene.add(fill);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ opacity: .13 }));
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -.134;
        ground.receiveShadow = true;
        scene.add(ground);

        const response = await fetch("/modelos/planta-03.glb", { signal: abort.signal });
        if (!response.ok) throw new Error("Model response unavailable");
        const result = await new GLTFLoader().parseAsync(await response.arrayBuffer(), "");
        model = result.scene;
        if (stopped) {
          disposeModel(model);
          return;
        }
        model.traverse((object) => {
          if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        scene.add(model);

        function fit() {
          const width = container.clientWidth;
          const height = container.clientHeight;
          if (!width || !height) return;
          camera.updateMatrixWorld();
          const bounds = new THREE.Box3().setFromObject(model);
          let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
          for (const x of [bounds.min.x, bounds.max.x]) {
            for (const y of [bounds.min.y, bounds.max.y]) {
              for (const z of [bounds.min.z, bounds.max.z]) {
                const point = new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse);
                xmin = Math.min(xmin, point.x); xmax = Math.max(xmax, point.x);
                ymin = Math.min(ymin, point.y); ymax = Math.max(ymax, point.y);
              }
            }
          }
          const aspect = width / height;
          const half = Math.max((ymax - ymin) / 2, (xmax - xmin) / 2 / aspect) * 1.12;
          Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half, zoom: 1 });
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          needsRender = true;
        }
        function stopRotation() {
          controls.autoRotate = false;
          setRotating(false);
        }
        actions.current = {
          preset(nextView) {
            stopRotation();
            controls.target.set(0, .65, 0);
            if (nextView === "top") camera.position.set(0, 35, .04);
            else camera.position.set(18, 26, 14);
            controls.update();
            fit();
            setView(nextView);
          },
          rotate() {
            if (controls.getPolarAngle() < .1) {
              camera.position.set(18, 26, 14);
              controls.update();
              fit();
            }
            controls.autoRotate = !controls.autoRotate;
            setRotating(controls.autoRotate);
            setView("perspective");
            needsRender = true;
          },
          zoom(factor) {
            camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
            camera.updateProjectionMatrix();
            needsRender = true;
          },
        };
        controls.addEventListener("start", stopRotation);
        resizeObserver = new ResizeObserver(fit);
        resizeObserver.observe(container);
        visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          needsRender = true;
        });
        visibilityObserver.observe(container);
        fit();
        renderer.render(scene, camera);
        renderer.setAnimationLoop(() => {
          if (stopped || !visible || document.hidden) return;
          const changed = controls.update();
          if (changed || needsRender) {
            renderer.render(scene, camera);
            needsRender = false;
          }
        });
        setReady(true);
      } catch {
        if (!stopped) {
          renderer?.setAnimationLoop(null);
          setError(true);
        }
      }
    }
    setup();
    return () => {
      stopped = true;
      abort.abort();
      actions.current = null;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      controls?.dispose();
      renderer?.setAnimationLoop(null);
      disposeModel(scene);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [attempt]);

  return (
    <div className="planInteractive">
      <div className="planStage" ref={host} />
      {!ready && !error && <p className="planOverlay" role="status">Carregando a planta 3D…</p>}
      {error && (
        <div className="planOverlay planError" role="alert">
          <p>Não foi possível abrir a vista 3D neste momento.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button>
          <a href="/modelos/planta-03.png" target="_blank" rel="noopener noreferrer">Ver imagem da planta</a>
        </div>
      )}
      <div className="planControls" role="group" aria-label="Controles da planta 3D">
        <button type="button" disabled={!ready} aria-pressed={view === "perspective" && !rotating} onClick={() => actions.current?.preset("perspective")}>Perspectiva</button>
        <button type="button" disabled={!ready} aria-pressed={view === "top"} onClick={() => actions.current?.preset("top")}>Vista de cima</button>
        <button type="button" disabled={!ready} aria-pressed={rotating} onClick={() => actions.current?.rotate()}>{rotating ? "Pausar giro" : "Girar 360°"}</button>
        <button type="button" disabled={!ready} aria-label="Aproximar a planta" onClick={() => actions.current?.zoom(1.25)}>+</button>
        <button type="button" disabled={!ready} aria-label="Afastar a planta" onClick={() => actions.current?.zoom(.8)}>−</button>
      </div>
      <p className="planGestureHint">Arraste para girar · Use a roda do mouse ou dois dedos para aproximar</p>
    </div>
  );
}

function disposeModel(object) {
  const geometries = new Set();
  const materials = new Set();
  object.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    if (node.material) {
      for (const material of Array.isArray(node.material) ? node.material : [node.material]) materials.add(material);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}
