"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PLAN_IMAGE = "/projetos/francenilson-aracaju-planta-3d.webp";

export default function TurntablePlanViewer() {
  const stageRef = useRef(null);
  const fullscreenRef = useRef(null);
  const actionsRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [view, setView] = useState("perspective");
  const [rotating, setRotating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = stageRef.current;
    let stopped = false;
    let renderer;
    let controls;
    let resizeObserver;
    let visibilityObserver;
    let visible = true;
    let needsRender = true;
    const scene = new THREE.Scene();

    setReady(false);
    setError(false);
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
        renderer.toneMappingExposure = 0.92;
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute(
          "aria-label",
          "Maquete 360 graus da Residência Lamarão. Arraste para girar e use os controles para mudar a vista.",
        );
        container.appendChild(renderer.domElement);
        renderer.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          renderer.setAnimationLoop(null);
          if (!stopped) {
            setReady(false);
            setError(true);
          }
        });

        const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
        camera.position.set(14.5, 13.5, 16.5);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.085;
        controls.enablePan = false;
        controls.minPolarAngle = 0.08;
        controls.maxPolarAngle = Math.PI * 0.47;
        controls.minZoom = 0.65;
        controls.maxZoom = 3.8;
        controls.autoRotateSpeed = 0.82;
        controls.update();

        scene.add(new THREE.HemisphereLight("#fff8eb", "#8e9389", 1.9));
        const sun = new THREE.DirectionalLight("#fff0d8", 2.2);
        sun.position.set(-7, 18, 11);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1536, 1536);
        Object.assign(sun.shadow.camera, {
          left: -15,
          right: 15,
          top: 15,
          bottom: -15,
          near: 0.5,
          far: 50,
        });
        sun.shadow.normalBias = 0.025;
        scene.add(sun);

        const pedestal = new THREE.Mesh(
          new THREE.BoxGeometry(16.45, 0.34, 9.45),
          new THREE.MeshStandardMaterial({ color: "#d6d0c2", roughness: 0.74, metalness: 0.04 }),
        );
        pedestal.position.y = -0.12;
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        scene.add(pedestal);

        const texture = await new THREE.TextureLoader().loadAsync(PLAN_IMAGE);
        if (stopped) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        const plan = new THREE.Mesh(
          new THREE.PlaneGeometry(16, 9),
          new THREE.MeshStandardMaterial({ map: texture, roughness: 0.86, metalness: 0 }),
        );
        plan.rotation.x = -Math.PI / 2;
        plan.position.y = 0.065;
        plan.receiveShadow = true;
        scene.add(plan);

        const ground = new THREE.Mesh(
          new THREE.PlaneGeometry(80, 80),
          new THREE.ShadowMaterial({ opacity: 0.17 }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.31;
        ground.receiveShadow = true;
        scene.add(ground);

        function fit() {
          const width = container.clientWidth;
          const height = container.clientHeight;
          if (!width || !height) return;
          const aspect = width / height;
          const halfHeight = aspect >= 1.34 ? 6.65 : 8.15 / aspect;
          Object.assign(camera, {
            left: -halfHeight * aspect,
            right: halfHeight * aspect,
            top: halfHeight,
            bottom: -halfHeight,
          });
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
          needsRender = true;
        }

        function setAutoRotate(next) {
          controls.autoRotate = next;
          setRotating(next);
          needsRender = true;
        }

        function setPreset(nextView) {
          setAutoRotate(false);
          camera.zoom = 1;
          controls.target.set(0, 0, 0);
          if (nextView === "top") camera.position.set(0, 24, 0.02);
          else camera.position.set(14.5, 13.5, 16.5);
          camera.updateProjectionMatrix();
          controls.update();
          setView(nextView);
          fit();
        }

        actionsRef.current = {
          preset: setPreset,
          rotate() {
            if (controls.getPolarAngle() < 0.12) {
              camera.position.set(14.5, 13.5, 16.5);
              controls.update();
            }
            setView("perspective");
            setAutoRotate(!controls.autoRotate);
          },
          zoom(factor) {
            camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
            camera.updateProjectionMatrix();
            needsRender = true;
          },
        };

        controls.addEventListener("start", () => setAutoRotate(false));
        resizeObserver = new ResizeObserver(fit);
        resizeObserver.observe(container);
        visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          needsRender = true;
        });
        visibilityObserver.observe(container);

        fit();
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setAutoRotate(!reduceMotion);
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
      actionsRef.current = null;
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      controls?.dispose();
      renderer?.setAnimationLoop(null);
      disposeScene(scene);
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [attempt]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await fullscreenRef.current?.requestFullscreen();
    } catch {
      // All remaining controls stay available when fullscreen is unsupported.
    }
  }

  return (
    <div className="planInteractive turntablePlan" ref={fullscreenRef}>
      <div className="planStage" ref={stageRef} />
      {!ready && !error && <p className="planOverlay" role="status">Preparando a vista 360°…</p>}
      {error && (
        <div className="planOverlay planError" role="alert">
          <p>Não foi possível abrir a vista 360° neste aparelho.</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</button>
          <a href={PLAN_IMAGE} target="_blank" rel="noopener noreferrer">Ver imagem da planta</a>
        </div>
      )}
      <div className="planControls" role="group" aria-label="Controles da maquete 360 graus">
        <button type="button" disabled={!ready} aria-pressed={view === "perspective" && !rotating} onClick={() => actionsRef.current?.preset("perspective")}>Perspectiva</button>
        <button type="button" disabled={!ready} aria-pressed={view === "top"} onClick={() => actionsRef.current?.preset("top")}>Vista de cima</button>
        <button type="button" disabled={!ready} aria-pressed={rotating} onClick={() => actionsRef.current?.rotate()}>{rotating ? "Pausar giro" : "Girar 360°"}</button>
        <button type="button" disabled={!ready} aria-label="Aproximar a planta" onClick={() => actionsRef.current?.zoom(1.25)}>+</button>
        <button type="button" disabled={!ready} aria-label="Afastar a planta" onClick={() => actionsRef.current?.zoom(0.8)}>−</button>
        <button type="button" disabled={!ready} onClick={toggleFullscreen}>{isFullscreen ? "Sair da tela cheia" : "Tela cheia"}</button>
      </div>
      <p className="planGestureHint">Arraste para girar 360° · Use a roda do mouse ou dois dedos para aproximar</p>
    </div>
  );
}

function disposeScene(object) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  object.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    if (!node.material) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      materials.add(material);
      if (material.map) textures.add(material.map);
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
}
