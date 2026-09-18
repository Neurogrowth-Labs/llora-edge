import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArchitecturalProject } from '../types/architecture';
import {
  Sun,
  Layers,
  Scissors,
  Eye,
  Camera,
  Maximize2,
  Minimize2,
  Compass,
  RotateCw,
  Wind,
  Sparkles,
  CloudRain,
  Cloud,
  CloudSnow,
  CloudFog,
  Moon,
  ShieldAlert,
  Sliders,
  Download,
  Info,
  Play,
  Pause,
  Thermometer,
  Gauge,
  Zap,
  Upload,
  X,
  Box,
  Circle,
  Triangle,
  Cuboid,
  Palette,
  Trash2,
} from 'lucide-react';
import { bimTextures } from '../services/bimTextures';
import {
  BimScenarioType,
  WeatherType,
  WEATHER_PRESETS,
  SCENARIO_DEFINITIONS,
} from '../services/weatherBimEngine';
import { APP_LOGO, APP_LOGO_STATIC_URL } from '../assets/logo';
import { downloadBrandedImage } from '../utils/letterheadStamper';
import { disposeImportedModel, importIfcModel } from '../services/ifcModelImporter';


interface Viewer3DProps {
  project: ArchitecturalProject;
  onOpenAiRender?: () => void;
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ project, onOpenAiRender }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Core State
  const [activeScenario, setActiveScenario] = useState<BimScenarioType>('architectural');
  const [activeWeather, setActiveWeather] = useState<WeatherType>('clear');
  const [timeOfDay, setTimeOfDay] = useState<number>(13.5); // 13:30 (1:30 PM)
  const [isPlayingSunLoop, setIsPlayingSunLoop] = useState<boolean>(false);
  const [sectionCutHeight, setSectionCutHeight] = useState<number>(15.0); // 15m (no cut)
  const [isolatedLevel, setIsolatedLevel] = useState<string>('all');
  const [explodedSpacing, setExplodedSpacing] = useState<number>(4.0); // vertical meters when in exploded mode
  const [cameraView, setCameraView] = useState<
    'perspective' | 'isometric' | 'top' | 'front' | 'walkthrough' | 'interior_living' | 'interior_master' | 'exterior_pool'
  >('perspective');
  const [showTrees, setShowTrees] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [ifcImportError, setIfcImportError] = useState<string | null>(null);
  const [hasImportedIfc, setHasImportedIfc] = useState(false);
  const [modelingTool, setModelingTool] = useState<'box' | 'cylinder' | 'cone' | 'sphere' | 'torus' | 'wedge' | 'pyramid'>('box');
  const [userSolids, setUserSolids] = useState<Array<{ id: string; kind: 'box' | 'cylinder' | 'cone' | 'sphere' | 'torus' | 'wedge' | 'pyramid'; color: string }>>([]);
  const [visualStyle, setVisualStyle] = useState<'realistic' | 'conceptual' | 'wireframe' | 'xray'>('realistic');


  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const weatherGroupRef = useRef<THREE.Group | null>(null);
  const interiorLightsGroupRef = useRef<THREE.Group | null>(null);
  const siteGroupRef = useRef<THREE.Group | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);
  const snowSystemRef = useRef<THREE.Points | null>(null);
  const windStreamlinesRef = useRef<THREE.Group | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const importedIfcRef = useRef<THREE.Group | null>(null);
  const userSolidsGroupRef = useRef<THREE.Group | null>(null);

  const ifcFileInputRef = useRef<HTMLInputElement>(null);

  // Orbit & Camera Controls State
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sphericalRef = useRef<{ radius: number; theta: number; phi: number }>({
    radius: 38,
    theta: Math.PI / 4,
    phi: Math.PI / 3,
  });
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(10, 2.5, 10));

  // --------------------------------------------------------------------------
  // INITIALIZE THREE.JS ENGINE WITH ULTRA-REALISTIC SETTINGS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0369a1');
    scene.fog = new THREE.FogExp2('#bae6fd', 0.005);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Ultra-Realistic WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.localClippingEnabled = true;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xe0f2fe, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.65);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Directional Physical Sun
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -35;
    sunLight.shadow.camera.right = 35;
    sunLight.shadow.camera.top = 35;
    sunLight.shadow.camera.bottom = -35;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 5. Scene Groups
    const siteGroup = new THREE.Group();
    scene.add(siteGroup);
    siteGroupRef.current = siteGroup;

    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    const interiorLightsGroup = new THREE.Group();
    scene.add(interiorLightsGroup);
    interiorLightsGroupRef.current = interiorLightsGroup;

    const weatherGroup = new THREE.Group();
    scene.add(weatherGroup);
    weatherGroupRef.current = weatherGroup;

    const userSolidsGroup = new THREE.Group();
    userSolidsGroup.name = 'User Modeling Solids';
    scene.add(userSolidsGroup);
    userSolidsGroupRef.current = userSolidsGroup;

    // Build Site & Building Geometry
    buildSiteTerrain(siteGroup);
    buildProject3DGeometry();
    buildWeatherParticleSystems(weatherGroup);

    // 6. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate Rain Particles
      if (rainSystemRef.current && rainSystemRef.current.visible) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 0.85; // Fall velocity
          if (positions[i] < 0) {
            positions[i] = 30 + Math.random() * 5;
          }
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Snow Particles
      if (snowSystemRef.current && snowSystemRef.current.visible) {
        const positions = snowSystemRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += Math.sin(elapsedTime * 2 + i) * 0.015; // lateral drift
          positions[i + 1] -= 0.12; // slow drift down
          if (positions[i + 1] < 0) {
            positions[i + 1] = 25 + Math.random() * 5;
          }
        }
        snowSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Aerodynamic Wind Streamlines
      if (windStreamlinesRef.current && windStreamlinesRef.current.visible) {
        windStreamlinesRef.current.children.forEach((child, idx) => {
          if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
            child.position.x += Math.sin(elapsedTime * 1.5 + idx) * 0.02;
          }
        });
      }

      // Animate Water Ripple
      if (waterMeshRef.current) {
        const mat = waterMeshRef.current.material as THREE.MeshPhysicalMaterial;
        if (mat.roughness) {
          mat.roughness = 0.08 + Math.sin(elapsedTime * 3) * 0.03;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (importedIfcRef.current) disposeImportedModel(importedIfcRef.current);

      renderer.dispose();
    };
  }, []);

  // Keyboard WASD Navigation for Walkthrough & Interactive Flythrough
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cameraRef.current) return;
      const key = e.key.toLowerCase();
      const moveSpeed = e.shiftKey ? 1.2 : 0.45;
      const forward = new THREE.Vector3();
      cameraRef.current.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      if (key === 'w' || key === 'arrowup') {
        targetRef.current.addScaledVector(forward, moveSpeed);
        updateCameraPosition();
      } else if (key === 's' || key === 'arrowdown') {
        targetRef.current.addScaledVector(forward, -moveSpeed);
        updateCameraPosition();
      } else if (key === 'a' || key === 'arrowleft') {
        targetRef.current.addScaledVector(right, -moveSpeed);
        updateCameraPosition();
      } else if (key === 'd' || key === 'arrowright') {
        targetRef.current.addScaledVector(right, moveSpeed);
        updateCameraPosition();
      } else if (key === 'q') {
        targetRef.current.y = Math.max(0.5, targetRef.current.y - moveSpeed);
        updateCameraPosition();
      } else if (key === 'e') {
        targetRef.current.y = Math.min(25, targetRef.current.y + moveSpeed);
        updateCameraPosition();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraView]);

  // --------------------------------------------------------------------------
  // SUN TIME-OF-DAY & SOLAR SIMULATION LOOP
  // --------------------------------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingSunLoop) {
      timer = setInterval(() => {
        setTimeOfDay((prev) => {
          const next = prev + 0.15;
          return next > 22 ? 6 : next;
        });
      }, 80);
    }
    return () => clearInterval(timer);
  }, [isPlayingSunLoop]);

  // Update Weather, Lighting & Sun Position
  useEffect(() => {
    updateAtmosphereAndLighting();
  }, [timeOfDay, activeWeather, activeScenario, project.site.orientationNorthDeg]);

  // Rebuild 3D Model when project, scenario, isolation or exploded mode changes
  useEffect(() => {
    buildProject3DGeometry();
  }, [project, activeScenario, isolatedLevel, sectionCutHeight, explodedSpacing, showTrees, showFurniture, activeWeather]);

  // TODO: God's Eye Context feature - to be implemented
  // useEffect(() => {
  //   if (godsEyeContextRef.current) godsEyeContextRef.current.visible = isGodsEyeContextVisible;
  // }, [isGodsEyeContextVisible]);

  // useEffect(() => {
  //   if (!sceneRef.current) return;
  //   if (godsEyeContextRef.current) {
  //     sceneRef.current.remove(godsEyeContextRef.current);
  //     disposeGodsEyeContext(godsEyeContextRef.current);
  //   }
  //   const context = createGodsEyeContext(project);
  //   context.visible = isGodsEyeContextVisible;
  //   sceneRef.current.add(context);
  //   godsEyeContextRef.current = context;
  // }, [project]);

  // --------------------------------------------------------------------------
  // ATMOSPHERE, SKY, SUN & LIGHTING LOGIC
  // --------------------------------------------------------------------------
  const updateAtmosphereAndLighting = () => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !hemiLightRef.current) return;

    const weather = WEATHER_PRESETS[activeWeather];
    const isNight = timeOfDay < 6.5 || timeOfDay > 19.5;
    const isSunset = (timeOfDay >= 6.5 && timeOfDay <= 8.0) || (timeOfDay >= 17.5 && timeOfDay <= 19.5);

    // 1. Calculate Solar Coordinates based on Latitude & Project Orientation
    const hourAngle = ((timeOfDay - 12) / 12) * Math.PI;
    const solarElevation = Math.max(-0.2, Math.cos(hourAngle) * 32);
    const sunX = Math.sin(hourAngle) * 45 + 10;
    const northRad = (project.site.orientationNorthDeg * Math.PI) / 180;
    const sunZ = -Math.sin(northRad) * 20 + 10;

    sunLightRef.current.position.set(sunX, Math.max(0.5, solarElevation), sunZ);
    sunLightRef.current.target.position.set(10, 2, 10);
    sunLightRef.current.target.updateMatrixWorld();

    // 2. Determine Sky Background & Fog Colors
    let skyColor = new THREE.Color(weather.skyTopColor);
    let fogColor = new THREE.Color(weather.fogColor);

    if (isNight || activeScenario === 'night_lighting') {
      skyColor = new THREE.Color('#030712');
      fogColor = new THREE.Color('#0b0f19');
      sunLightRef.current.intensity = 0.15;
      sunLightRef.current.color.setHex(0x38bdf8); // Moonlight
      ambientLightRef.current.intensity = 0.25;
      ambientLightRef.current.color.setHex(0x1e293b);
      hemiLightRef.current.intensity = 0.2;
    } else if (isSunset) {
      skyColor = new THREE.Color('#7c2d12'); // Deep twilight orange
      fogColor = new THREE.Color('#fdba74');
      sunLightRef.current.intensity = weather.sunIntensity * 0.9;
      sunLightRef.current.color.setHex(0xfb923c); // Warm golden hour
      ambientLightRef.current.intensity = weather.ambientIntensity * 0.8;
      ambientLightRef.current.color.setHex(0xfed7aa);
      hemiLightRef.current.intensity = 0.5;
    } else {
      sunLightRef.current.intensity = weather.sunIntensity;
      sunLightRef.current.color.set(weather.sunColor);
      ambientLightRef.current.intensity = weather.ambientIntensity;
      ambientLightRef.current.color.set(weather.ambientColor);
      hemiLightRef.current.intensity = 0.65;
    }

    sceneRef.current.background = skyColor;
    sceneRef.current.fog = new THREE.FogExp2(fogColor, weather.fogDensity);

    // 3. Toggle Weather Particle Systems Visibility
    if (rainSystemRef.current) {
      rainSystemRef.current.visible = activeWeather === 'rain';
    }
    if (snowSystemRef.current) {
      snowSystemRef.current.visible = activeWeather === 'snow';
    }
    if (windStreamlinesRef.current) {
      windStreamlinesRef.current.visible = activeWeather === 'wind';
    }

    // 4. Interior Architectural Downlights (Active at dusk/night or in Night Lighting scenario)
    if (interiorLightsGroupRef.current) {
      const enableInteriorLights = isNight || isSunset || activeScenario === 'night_lighting';
      interiorLightsGroupRef.current.visible = enableInteriorLights;
    }
  };

  // --------------------------------------------------------------------------
  // BUILD SITE & SURROUNDINGS (Landscape, Grass, Pavement, Trees)
  // --------------------------------------------------------------------------
  const buildSiteTerrain = (group: THREE.Group) => {
    while (group.children.length > 0) group.remove(group.children[0]);

    const siteW = Math.max(35, project.site.widthM + 15);
    const siteD = Math.max(35, project.site.depthM + 15);

    // 1. Manicured Natural Lawn
    const lawnGeo = new THREE.PlaneGeometry(siteW, siteD);
    const lawnMat = new THREE.MeshStandardMaterial({
      map: bimTextures.getGrassTexture(),
      roughness: 0.85,
      metalness: 0.05,
    });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(project.site.widthM / 2, -0.05, project.site.depthM / 2);
    lawn.receiveShadow = true;
    group.add(lawn);

    // 2. Entrance Driveway & Paved Walkway
    const driveGeo = new THREE.BoxGeometry(7, 0.06, 12);
    const driveMat = new THREE.MeshStandardMaterial({
      map: bimTextures.getStonePaversTexture(),
      roughness: 0.7,
      metalness: 0.1,
    });
    const driveway = new THREE.Mesh(driveGeo, driveMat);
    driveway.position.set(4.5, -0.02, 4);
    driveway.receiveShadow = true;
    group.add(driveway);

    // 3. Site Grid & Boundary Outline
    const boundaryGeo = new THREE.BoxGeometry(project.site.widthM, 0.12, project.site.depthM);
    const boundaryEdges = new THREE.EdgesGeometry(boundaryGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf, linewidth: 2 });
    const boundaryWire = new THREE.LineSegments(boundaryEdges, lineMat);
    boundaryWire.position.set(project.site.widthM / 2, 0.02, project.site.depthM / 2);
    group.add(boundaryWire);
  };

  // --------------------------------------------------------------------------
  // WEATHER PARTICLE SYSTEMS (Rain, Snow, Wind Streamlines)
  // --------------------------------------------------------------------------
  const buildWeatherParticleSystems = (group: THREE.Group) => {
    while (group.children.length > 0) group.remove(group.children[0]);

    // 1. Rain Droplets System (2,500 particles)
    const rainCount = 2500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 60 + 10;
      rainPositions[i + 1] = Math.random() * 30;
      rainPositions[i + 2] = (Math.random() - 0.5) * 60 + 10;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.75,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    group.add(rainPoints);
    rainSystemRef.current = rainPoints;

    // 2. Snowflakes System (2,000 particles)
    const snowCount = 2000;
    const snowGeo = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount * 3; i += 3) {
      snowPositions[i] = (Math.random() - 0.5) * 60 + 10;
      snowPositions[i + 1] = Math.random() * 25;
      snowPositions[i + 2] = (Math.random() - 0.5) * 60 + 10;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
    });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    snowPoints.visible = false;
    group.add(snowPoints);
    snowSystemRef.current = snowPoints;

    // 3. Aerodynamic Wind Streamline Curves
    const windGroup = new THREE.Group();
    const streamlineCount = 14;
    for (let s = 0; s < streamlineCount; s++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-15, 1.5 + s * 0.8, -5 + s * 2.5),
        new THREE.Vector3(2, 2.5 + Math.sin(s) * 1.5, 6 + s * 1.8),
        new THREE.Vector3(12, 4.0 + Math.cos(s) * 2, 12 + s * 1.5),
        new THREE.Vector3(32, 2.0 + s * 0.5, 24 + s * 1.2),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.06, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: s % 2 === 0 ? 0x38bdf8 : 0x2dd4bf,
        transparent: true,
        opacity: 0.45,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      windGroup.add(tubeMesh);
    }
    windGroup.visible = false;
    group.add(windGroup);
    windStreamlinesRef.current = windGroup;
  };

  // --------------------------------------------------------------------------
  // PROCEDURAL 3D ARCHITECTURAL TREES & BIOPHILIC VEGETATION
  // --------------------------------------------------------------------------
  const addProceduralTree = (group: THREE.Group, x: number, z: number, scale = 1.0) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.15 * scale, 0.22 * scale, 2.8 * scale, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.4 * scale;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // Multi-tier Faceted Canopy
    const canopyColors = [0x15803d, 0x16a34a, 0x22c55e];
    for (let c = 0; c < 3; c++) {
      const foliageGeo = new THREE.ConeGeometry((1.8 - c * 0.35) * scale, (2.2 - c * 0.3) * scale, 7);
      const foliageMat = new THREE.MeshStandardMaterial({
        color: canopyColors[c],
        roughness: 0.8,
        flatShading: true,
      });
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = (2.6 + c * 1.1) * scale;
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      tree.add(foliage);
    }

    group.add(tree);
  };

  // --------------------------------------------------------------------------
  // BUILD FULL 3D BIM GEOMETRY ENGINE
  // --------------------------------------------------------------------------
  const buildProject3DGeometry = () => {
    const group = buildingGroupRef.current;
    const lightsGroup = interiorLightsGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) group.remove(group.children[0]);
    if (lightsGroup) {
      while (lightsGroup.children.length > 0) lightsGroup.remove(lightsGroup.children[0]);
    }

    // Section Clipping Plane
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), sectionCutHeight);
    const weather = WEATHER_PRESETS[activeWeather];

    // Wetness roughness modifier
    const wetRoughness = Math.max(0.05, 0.5 + weather.groundRoughnessOffset);

    // ------------------------------------------------------------------------
    // SCENARIO-ADAPTIVE MATERIALS
    // ------------------------------------------------------------------------
    // Concrete Walls
    const concreteWallMat =
      activeScenario === 'solar_heatmap'
        ? new THREE.MeshStandardMaterial({ map: bimTextures.getSolarHeatmapTexture(), roughness: 0.5, clippingPlanes: [clipPlane] })
        : activeScenario === 'thermal_envelope'
        ? new THREE.MeshStandardMaterial({ map: bimTextures.getThermalHeatmapTexture(), roughness: 0.5, clippingPlanes: [clipPlane] })
        : activeScenario === 'structural_xray'
        ? new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.22, roughness: 0.2, transmission: 0.8, clippingPlanes: [clipPlane] })
        : new THREE.MeshStandardMaterial({
            map: bimTextures.getConcreteTexture(),
            roughness: wetRoughness,
            metalness: 0.05,
            clippingPlanes: [clipPlane],
            clipShadows: true,
          });

    // Mass Timber CLT Walls & Ceilings
    const timberCltMat =
      activeScenario === 'solar_heatmap'
        ? new THREE.MeshStandardMaterial({ map: bimTextures.getSolarHeatmapTexture(), clippingPlanes: [clipPlane] })
        : activeScenario === 'thermal_envelope'
        ? new THREE.MeshStandardMaterial({ map: bimTextures.getThermalHeatmapTexture(), clippingPlanes: [clipPlane] })
        : activeScenario === 'structural_xray'
        ? new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4, wireframe: false, clippingPlanes: [clipPlane] })
        : new THREE.MeshStandardMaterial({
            map: bimTextures.getTimberTexture(),
            roughness: 0.65,
            metalness: 0.05,
            clippingPlanes: [clipPlane],
          });

    // High-End Architectural Low-E Glass
    const glassMat =
      activeScenario === 'thermal_envelope'
        ? new THREE.MeshStandardMaterial({ color: 0xef4444, transparent: true, opacity: 0.75, clippingPlanes: [clipPlane] })
        : new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.35,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.92,
            ior: 1.52,
            reflectivity: 0.8,
            clippingPlanes: [clipPlane],
          });

    // Window Frames / Mullions
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.85,
      clippingPlanes: [clipPlane],
    });

    // Floor Slabs & Balconies
    const floorSlabMat =
      activeScenario === 'structural_xray'
        ? new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, clippingPlanes: [clipPlane] })
        : new THREE.MeshStandardMaterial({
            map: bimTextures.getStonePaversTexture(),
            roughness: wetRoughness,
            clippingPlanes: [clipPlane],
          });

    // Photovoltaic Solar Panels
    const roofSolarMat = new THREE.MeshStandardMaterial({
      map: bimTextures.getSolarPVTexture(),
      roughness: 0.15,
      metalness: 0.85,
    });

    // Swimming Pool Water with realistic caustics & reflections
    const waterPoolMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.82,
      roughness: 0.04,
      transmission: 0.88,
      ior: 1.333,
    });

    // Structural Columns Material
    const columnMat = new THREE.MeshStandardMaterial({
      color: activeScenario === 'structural_xray' ? 0x06b6d4 : 0x475569,
      roughness: 0.4,
      metalness: activeScenario === 'structural_xray' ? 0.8 : 0.2,
      emissive: activeScenario === 'structural_xray' ? 0x0891b2 : 0x000000,
      emissiveIntensity: activeScenario === 'structural_xray' ? 0.6 : 0,
      clippingPlanes: [clipPlane],
    });

    // ------------------------------------------------------------------------
    // 1. FLOOR SLABS PER LEVEL (Supports Exploded Axonometric Mode & Custom Finishes)
    // ------------------------------------------------------------------------
    project.levels.forEach((lvl, lvlIdx) => {
      if (isolatedLevel !== 'all' && isolatedLevel !== lvl.id) return;

      const yOffset = activeScenario === 'exploded_bim' ? lvlIdx * explodedSpacing : 0;
      const elevation = lvl.elevation + yOffset;
      const slabThick = lvl.slabThickness || 0.28;

      // Dynamic Level Floor Finish Material
      const finishMatLower = (lvl.floorFinishMaterial || '').toLowerCase();
      let levelTexture = bimTextures.getStonePaversTexture();
      let levelRoughness = wetRoughness;
      const floorColor = new THREE.Color(lvl.floorFinishColor || '#cbd5e1');

      if (
        finishMatLower.includes('oak') ||
        finishMatLower.includes('parquet') ||
        finishMatLower.includes('timber') ||
        lvl.tilePattern === 'herringbone_parquet'
      ) {
        levelTexture = bimTextures.getParquetTexture();
        levelRoughness = 0.55;
      } else if (
        finishMatLower.includes('travertine') ||
        finishMatLower.includes('marble') ||
        lvl.tilePattern === 'travertine_stone'
      ) {
        levelTexture = bimTextures.getTravertineTexture();
        levelRoughness = 0.35;
      } else if (
        finishMatLower.includes('terrazzo') ||
        lvl.tilePattern === 'polished_terrazzo'
      ) {
        levelTexture = bimTextures.getTerrazzoTexture();
        levelRoughness = 0.3;
      } else if (
        finishMatLower.includes('concrete') ||
        finishMatLower.includes('cement') ||
        lvl.structuralType === 'post_tensioned_concrete'
      ) {
        levelTexture = bimTextures.getConcreteTexture();
        levelRoughness = 0.65;
      }

      const customLevelFloorMat =
        activeScenario === 'structural_xray'
          ? new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, clippingPlanes: [clipPlane] })
          : activeScenario === 'thermal_envelope'
          ? new THREE.MeshStandardMaterial({ map: bimTextures.getThermalHeatmapTexture(), clippingPlanes: [clipPlane] })
          : activeScenario === 'solar_heatmap'
          ? new THREE.MeshStandardMaterial({ map: bimTextures.getSolarHeatmapTexture(), clippingPlanes: [clipPlane] })
          : new THREE.MeshStandardMaterial({
              map: levelTexture,
              color: floorColor,
              roughness: levelRoughness,
              clippingPlanes: [clipPlane],
            });

      // Slab Body with customized thickness
      const slabMesh = new THREE.Mesh(
        new THREE.BoxGeometry(18, slabThick, 18),
        customLevelFloorMat
      );
      slabMesh.position.set(10, elevation + slabThick / 2, 12);
      slabMesh.receiveShadow = true;
      slabMesh.castShadow = true;
      group.add(slabMesh);

      // Exploded Axo Level Indicator Pin
      if (activeScenario === 'exploded_bim') {
        const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, yOffset, 6);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.6 });
        const pin1 = new THREE.Mesh(pinGeo, pinMat);
        pin1.position.set(1, elevation - yOffset / 2, 3);
        group.add(pin1);

        const pin2 = new THREE.Mesh(pinGeo, pinMat);
        pin2.position.set(19, elevation - yOffset / 2, 21);
        group.add(pin2);
      }
    });

    // ------------------------------------------------------------------------
    // 1b. ROOM FLOOR FINISH INLAYS (Highlights distinct materials per space)
    // ------------------------------------------------------------------------
    project.rooms.forEach((room) => {
      if (isolatedLevel !== 'all' && isolatedLevel !== room.levelId) return;

      const lvlIdx = project.levels.findIndex((l) => l.id === room.levelId);
      const level = project.levels[lvlIdx];
      const baseElev = level ? level.elevation : 0;
      const slabThick = level ? (level.slabThickness || 0.28) : 0.28;
      const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

      if (room.points && room.points.length >= 3) {
        const shape = new THREE.Shape();
        shape.moveTo(room.points[0].x, -room.points[0].y);
        for (let i = 1; i < room.points.length; i++) {
          shape.lineTo(room.points[i].x, -room.points[i].y);
        }
        shape.closePath();

        const finishName = (room.finishFloorMaterial || '').toLowerCase();
        let roomTex = bimTextures.getParquetTexture();
        if (finishName.includes('terrazzo')) roomTex = bimTextures.getTerrazzoTexture();
        else if (finishName.includes('travertine') || finishName.includes('marble')) roomTex = bimTextures.getTravertineTexture();
        else if (finishName.includes('concrete')) roomTex = bimTextures.getConcreteTexture();

        const roomMat = new THREE.MeshStandardMaterial({
          map: roomTex,
          color: new THREE.Color(room.colorHex || '#0284c7'),
          roughness: 0.45,
          metalness: 0.1,
          transparent: true,
          opacity: 0.65,
          clippingPlanes: [clipPlane],
        });

        const geom = new THREE.ShapeGeometry(shape);
        const mesh = new THREE.Mesh(geom, roomMat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, baseElev + yOffset + slabThick + 0.01, 0);
        mesh.receiveShadow = true;
        group.add(mesh);
      }
    });

    // ------------------------------------------------------------------------
    // 2. WALLS 3D EXTRUSIONS & OPENINGS
    // ------------------------------------------------------------------------
    project.walls.forEach((wall) => {
      if (isolatedLevel !== 'all' && isolatedLevel !== wall.levelId) return;

      const lvlIdx = project.levels.findIndex((l) => l.id === wall.levelId);
      const level = project.levels[lvlIdx];
      const baseElev = level ? level.elevation : 0;
      const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const length = Math.hypot(dx, dy);
      if (length <= 0.05) return;

      const angle = Math.atan2(dy, dx);
      const centerX = (wall.start.x + wall.end.x) / 2;
      const centerZ = (wall.start.y + wall.end.y) / 2;
      const centerY = baseElev + yOffset + wall.height / 2;

      const wallGeo = new THREE.BoxGeometry(length, wall.height, wall.thickness);
      const isTimber = wall.materialId?.includes('clt') || wall.materialId?.includes('timber');
      const mat = isTimber ? timberCltMat : concreteWallMat;

      const wallMesh = new THREE.Mesh(wallGeo, mat);
      wallMesh.position.set(centerX, centerY, centerZ);
      wallMesh.rotation.y = -angle;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      group.add(wallMesh);
    });

    // ------------------------------------------------------------------------
    // 3. WINDOWS WITH METALLIC FRAMES & LOW-E GLAZING
    // ------------------------------------------------------------------------
    project.windows.forEach((win) => {
      const wall = project.walls.find((w) => w.id === win.wallId);
      if (!wall) return;
      if (isolatedLevel !== 'all' && isolatedLevel !== win.levelId) return;

      const lvlIdx = project.levels.findIndex((l) => l.id === win.levelId);
      const level = project.levels[lvlIdx];
      const baseElev = level ? level.elevation : 0;
      const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

      const posX = wall.start.x + (wall.end.x - wall.start.x) * win.position;
      const posZ = wall.start.y + (wall.end.y - wall.start.y) * win.position;
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const angle = Math.atan2(dy, dx);

      const winGroup = new THREE.Group();
      winGroup.position.set(posX, baseElev + yOffset + win.sillHeight + win.height / 2, posZ);
      winGroup.rotation.y = -angle;

      // 1. Glass Pane
      const glassMesh = new THREE.Mesh(
        new THREE.BoxGeometry(win.width - 0.08, win.height - 0.08, 0.03),
        glassMat
      );
      winGroup.add(glassMesh);

      // 2. Exterior Dark Aluminum Frame
      const frameMesh = new THREE.Mesh(
        new THREE.BoxGeometry(win.width, win.height, wall.thickness + 0.04),
        frameMat
      );
      // Punch center hole for frame
      winGroup.add(frameMesh);

      group.add(winGroup);
    });

    // ------------------------------------------------------------------------
    // 4. DOORS WITH TIMBER PANELS & METALLIC HANDLES
    // ------------------------------------------------------------------------
    project.doors.forEach((door) => {
      const wall = project.walls.find((w) => w.id === door.wallId);
      if (!wall) return;
      if (isolatedLevel !== 'all' && isolatedLevel !== door.levelId) return;

      const lvlIdx = project.levels.findIndex((l) => l.id === door.levelId);
      const level = project.levels[lvlIdx];
      const baseElev = level ? level.elevation : 0;
      const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

      const posX = wall.start.x + (wall.end.x - wall.start.x) * door.position;
      const posZ = wall.start.y + (wall.end.y - wall.start.y) * door.position;
      const dx = wall.end.x - wall.start.x;
      const dy = wall.end.y - wall.start.y;
      const angle = Math.atan2(dy, dx);

      const doorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(door.width, door.height, wall.thickness + 0.02),
        timberCltMat
      );
      doorMesh.position.set(posX, baseElev + yOffset + door.height / 2, posZ);
      doorMesh.rotation.y = -angle;
      group.add(doorMesh);
    });

    // ------------------------------------------------------------------------
    // 5. STRUCTURAL COLUMNS
    // ------------------------------------------------------------------------
    project.columns.forEach((col) => {
      if (isolatedLevel !== 'all' && isolatedLevel !== col.levelId) return;

      const lvlIdx = project.levels.findIndex((l) => l.id === col.levelId);
      const level = project.levels[lvlIdx];
      const baseElev = level ? level.elevation : 0;
      const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;
      const colHeight = level ? level.height : 3.0;

      const colGeo =
        col.shape === 'circular'
          ? new THREE.CylinderGeometry(col.width / 2, col.width / 2, colHeight, 16)
          : new THREE.BoxGeometry(col.width, colHeight, col.depth);

      const colMesh = new THREE.Mesh(colGeo, columnMat);
      colMesh.position.set(col.position.x, baseElev + yOffset + colHeight / 2, col.position.y);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      group.add(colMesh);
    });

    // ------------------------------------------------------------------------
    // 6. SWIMMING POOL WITH ILLUMINATION & WATER REFLECTIONS
    // ------------------------------------------------------------------------
    const poolMesh = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.12, 3.8),
      waterPoolMat
    );
    poolMesh.position.set(10, 0.04, 2.5);
    poolMesh.receiveShadow = true;
    group.add(poolMesh);
    waterMeshRef.current = poolMesh;

    // Pool underwater turquoise glow
    if (lightsGroup) {
      const poolLight = new THREE.PointLight(0x06b6d4, 1.8, 12);
      poolLight.position.set(10, 0.2, 2.5);
      lightsGroup.add(poolLight);
    }

    // ------------------------------------------------------------------------
    // 7. ROOFTOP SOLAR PHOTOVOLTAIC ARRAY
    // ------------------------------------------------------------------------
    if (isolatedLevel === 'all' || isolatedLevel === 'lvl_roof') {
      const roofYOffset = activeScenario === 'exploded_bim' ? project.levels.length * explodedSpacing : 0;
      const solarArrayMesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, 0.08, 5.5),
        roofSolarMat
      );
      solarArrayMesh.position.set(10, 6.3 + roofYOffset, 11);
      solarArrayMesh.rotation.x = -0.18; // Tilted toward North/Sun
      solarArrayMesh.castShadow = true;
      solarArrayMesh.receiveShadow = true;
      group.add(solarArrayMesh);
    }

    // ------------------------------------------------------------------------
    // 8. INTERIOR CEILING DOWNLIGHTS (Night Lighting & Twilight)
    // ------------------------------------------------------------------------
    if (lightsGroup) {
      project.rooms.forEach((room) => {
        if (isolatedLevel !== 'all' && isolatedLevel !== room.levelId) return;

        const lvlIdx = project.levels.findIndex((l) => l.id === room.levelId);
        const level = project.levels[lvlIdx];
        const baseElev = level ? level.elevation : 0;
        const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

        // Find room centroid
        let cx = 0, cy = 0;
        room.points.forEach((pt) => {
          cx += pt.x;
          cy += pt.y;
        });
        cx /= room.points.length;
        cy /= room.points.length;

        // Warm 2700K Recessed Ceiling Downlight
        const downlight = new THREE.PointLight(0xfef08a, 1.6, 8, 2);
        downlight.position.set(cx, baseElev + yOffset + room.ceilingHeight - 0.2, cy);
        lightsGroup.add(downlight);

        // Visual Fixture Mesh
        const fixtureGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 8);
        const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
        const fixtureMesh = new THREE.Mesh(fixtureGeo, fixtureMat);
        fixtureMesh.position.copy(downlight.position);
        lightsGroup.add(fixtureMesh);
      });
    }

    // ------------------------------------------------------------------------
    // 9. BIOPHILIC LANDSCAPING TREES (If enabled)
    // ------------------------------------------------------------------------
    if (showTrees) {
      const treeCoords = [
        [1.5, 2.0, 1.2],
        [1.2, 10.0, 1.1],
        [18.5, 3.0, 1.3],
        [19.0, 14.0, 1.0],
        [18.0, 20.0, 1.25],
        [3.0, 21.0, 0.9],
      ];
      treeCoords.forEach(([tx, tz, ts]) => {
        addProceduralTree(group, tx, tz, ts);
      });
    }

    // ------------------------------------------------------------------------
    // 10. 3D SPATIAL FURNITURE (King Bed, Sectional Sofa, Sedan Car)
    // ------------------------------------------------------------------------
    if (showFurniture) {
      project.furniture.forEach((furn) => {
        if (isolatedLevel !== 'all' && isolatedLevel !== furn.levelId) return;

        const lvlIdx = project.levels.findIndex((l) => l.id === furn.levelId);
        const level = project.levels[lvlIdx];
        const baseElev = level ? level.elevation : 0;
        const yOffset = activeScenario === 'exploded_bim' && lvlIdx >= 0 ? lvlIdx * explodedSpacing : 0;

        const furnMesh = new THREE.Mesh(
          new THREE.BoxGeometry(furn.width, 0.45, furn.depth),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 })
        );
        furnMesh.position.set(furn.position.x, baseElev + yOffset + 0.22, furn.position.y);
        furnMesh.rotation.y = -(furn.rotation * Math.PI) / 180;
        furnMesh.castShadow = true;
        group.add(furnMesh);
      });
    }
  };

  // --------------------------------------------------------------------------
  // CAMERA ORBIT & INTERACTION METHODS
  // --------------------------------------------------------------------------
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = targetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (e.buttons === 1) {
      // Left click: Orbit
      sphericalRef.current.theta -= deltaX * 0.007;
      sphericalRef.current.phi = Math.max(0.08, Math.min(Math.PI / 2 - 0.02, sphericalRef.current.phi - deltaY * 0.007));
    } else if (e.buttons === 2 || e.buttons === 4) {
      // Right or Middle click: Pan
      const forward = new THREE.Vector3();
      if (cameraRef.current) cameraRef.current.getWorldDirection(forward);
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      targetRef.current.addScaledVector(right, -deltaX * 0.035);
      targetRef.current.y += deltaY * 0.035;
    }

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(6, Math.min(120, sphericalRef.current.radius + e.deltaY * 0.04));
    updateCameraPosition();
  };

  const setPresetView = (
    view: 'perspective' | 'isometric' | 'top' | 'front' | 'walkthrough' | 'interior_living' | 'interior_master' | 'exterior_pool'
  ) => {
    setCameraView(view);
    if (view === 'top') {
      sphericalRef.current = { radius: 46, theta: 0, phi: 0.05 };
      targetRef.current.set(10, 0, 10);
    } else if (view === 'front') {
      sphericalRef.current = { radius: 36, theta: 0, phi: Math.PI / 2.15 };
      targetRef.current.set(10, 3, 10);
    } else if (view === 'isometric') {
      sphericalRef.current = { radius: 44, theta: Math.PI / 4, phi: Math.PI / 3.2 };
      targetRef.current.set(10, 3, 10);
    } else if (view === 'walkthrough') {
      sphericalRef.current = { radius: 12, theta: Math.PI / 6, phi: Math.PI / 2.1 };
      targetRef.current.set(10, 1.7, 8);
    } else if (view === 'interior_living') {
      // Find living room centroid
      const livingRoom =
        project.rooms.find((r) => r.type === 'living' || r.name.toLowerCase().includes('living')) || project.rooms[0];
      let cx = 10;
      let cz = 10;
      if (livingRoom && livingRoom.points.length > 0) {
        cx = livingRoom.points.reduce((acc, p) => acc + p.x, 0) / livingRoom.points.length;
        cz = livingRoom.points.reduce((acc, p) => acc + p.y, 0) / livingRoom.points.length;
      }
      sphericalRef.current = { radius: 5.5, theta: Math.PI / 3, phi: Math.PI / 2.05 };
      targetRef.current.set(cx, 1.6, cz);
    } else if (view === 'interior_master') {
      const bedRoom =
        project.rooms.find((r) => r.type === 'bedroom' || r.name.toLowerCase().includes('bed')) ||
        project.rooms[1] ||
        project.rooms[0];
      let cx = 14;
      let cz = 14;
      if (bedRoom && bedRoom.points.length > 0) {
        cx = bedRoom.points.reduce((acc, p) => acc + p.x, 0) / bedRoom.points.length;
        cz = bedRoom.points.reduce((acc, p) => acc + p.y, 0) / bedRoom.points.length;
      }
      const lvl = project.levels.find((l) => l.id === bedRoom?.levelId);
      const elev = lvl ? lvl.elevation : 3.2;
      sphericalRef.current = { radius: 4.8, theta: -Math.PI / 4, phi: Math.PI / 2.05 };
      targetRef.current.set(cx, elev + 1.6, cz);
    } else if (view === 'exterior_pool') {
      sphericalRef.current = { radius: 15, theta: -Math.PI / 8, phi: Math.PI / 2.12 };
      targetRef.current.set(10, 1.4, 3.5);
    } else {
      sphericalRef.current = { radius: 38, theta: Math.PI / 4, phi: Math.PI / 2.9 };
      targetRef.current.set(10, 2.5, 10);
    }
    updateCameraPosition();
  };

  // --------------------------------------------------------------------------
  // 4K HIGH-RES SNAPSHOT EXPORTER WITH OFFICIAL LETTERHEAD & LOGO
  // --------------------------------------------------------------------------
  const handleCaptureSnapshot = async () => {
    if (!rendererRef.current) return;
    setIsCapturing(true);
    try {
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      await downloadBrandedImage(
        dataUrl,
        `${project.name.replace(/\s+/g, '_')}_3D_BIM_${activeScenario}_${activeWeather}.jpg`,
        {
          projectName: project.name,
          viewTitle: `3D BIM Model • ${activeScenarioConfig.label} (${activeWeatherConfig.name})`,
          category: 'Interactive 3D BIM Perspective',
          companyName: project.companyName,
          architectName: project.architectName,
          location: project.climate.location,
          engine: 'Three.js BIM Render Pipeline',
          date: new Date().toISOString().slice(0, 10),
          stage: 'Architectural 3D BIM Design',
        }
      );
    } catch (e) {
      console.error('3D snapshot stamping error:', e);
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${project.name.replace(/\s+/g, '_')}_3D_BIM_${activeScenario}_${activeWeather}.png`;
      a.click();
    } finally {
      setIsCapturing(false);
    }
  };

  const handleIfcFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !sceneRef.current) return;

    setIfcImportError(null);
    try {
      const model = await importIfcModel(file);
      if (importedIfcRef.current) {
        sceneRef.current.remove(importedIfcRef.current);
        disposeImportedModel(importedIfcRef.current);
      }
      sceneRef.current.add(model);
      importedIfcRef.current = model;
      setHasImportedIfc(true);
    } catch (error) {
      setIfcImportError(error instanceof Error ? error.message : 'Unable to import IFC model.');
    }
  };

  const clearIfcModel = () => {
    if (!importedIfcRef.current || !sceneRef.current) return;
    sceneRef.current.remove(importedIfcRef.current);
    disposeImportedModel(importedIfcRef.current);
    importedIfcRef.current = null;
    setHasImportedIfc(false);
    setIfcImportError(null);
  };

  const addSolid = (kind: typeof modelingTool) => {
    const palette = ['#2DD4BF', '#38BDF8', '#A78BFA', '#F59E0B', '#FB7185'];
    setUserSolids((solids) => [...solids, { id: `solid_${Date.now()}_${solids.length}`, kind, color: palette[solids.length % palette.length] }]);
  };

  useEffect(() => {
    const group = userSolidsGroupRef.current;
    if (!group) return;
    group.clear();
    userSolids.forEach((solid, index) => {
      const material = new THREE.MeshStandardMaterial({ color: solid.color, roughness: 0.38, metalness: 0.12 });
      let geometry: THREE.BufferGeometry;
      switch (solid.kind) {
        case 'cylinder': geometry = new THREE.CylinderGeometry(1, 1, 2.2, 32); break;
        case 'cone': geometry = new THREE.ConeGeometry(1.1, 2.4, 32); break;
        case 'sphere': geometry = new THREE.SphereGeometry(1.15, 32, 20); break;
        case 'torus': geometry = new THREE.TorusGeometry(1, 0.3, 16, 36); break;
        case 'wedge': geometry = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 3); break;
        case 'pyramid': geometry = new THREE.ConeGeometry(1.35, 2.5, 4); break;
        default: geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
      }
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.position.set(3 + (index % 4) * 3.2, 1.2, 3 + Math.floor(index / 4) * 3.2);
      group.add(mesh);
    });
  }, [userSolids]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (!('wireframe' in material)) return;
        material.wireframe = visualStyle === 'wireframe';
        if ('flatShading' in material) material.flatShading = visualStyle === 'conceptual';
        material.transparent = visualStyle === 'xray';
        material.opacity = visualStyle === 'xray' ? 0.28 : 1;
        material.needsUpdate = true;
      });
    });
  }, [visualStyle, project, userSolids]);

  const activeWeatherConfig = WEATHER_PRESETS[activeWeather];
  const activeScenarioConfig = SCENARIO_DEFINITIONS[activeScenario];

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-[#050505] overflow-hidden select-none cursor-grab active:cursor-grabbing font-sans"
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* TOP SCENARIO SELECTION BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
        {/* Left: Scenario Selector Pills */}
        <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#222222] p-1.5 rounded-lg shadow-2xl flex items-center gap-1 pointer-events-auto overflow-x-auto max-w-2xl scrollbar-none">
          {(Object.keys(SCENARIO_DEFINITIONS) as BimScenarioType[]).map((scKey) => {
            const sc = SCENARIO_DEFINITIONS[scKey];
            const isSelected = activeScenario === scKey;
            return (
              <button
                key={scKey}
                onClick={() => {
                  setActiveScenario(scKey);
                  if (scKey === 'exploded_bim') {
                    setPresetView('isometric');
                  }
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#2DD4BF] text-[#050505] shadow-md shadow-[#2DD4BF]/20 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-[#141414]'
                }`}
                title={sc.description}
              >
                {scKey === 'architectural' && <Sparkles className="w-3.5 h-3.5" />}
                {scKey === 'solar_heatmap' && <Sun className="w-3.5 h-3.5" />}
                {scKey === 'structural_xray' && <Layers className="w-3.5 h-3.5" />}
                {scKey === 'thermal_envelope' && <ShieldAlert className="w-3.5 h-3.5" />}
                {scKey === 'night_lighting' && <Moon className="w-3.5 h-3.5" />}
                {scKey === 'exploded_bim' && <Maximize2 className="w-3.5 h-3.5" />}
                <span>{sc.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action: Generate Photorealistic Design Render CTA */}
        {onOpenAiRender && (
          <button
            onClick={onOpenAiRender}
            className="bg-[#2DD4BF] hover:brightness-110 text-[#050505] font-bold text-xs py-2 px-3.5 rounded-lg shadow-lg shadow-[#2DD4BF]/20 flex items-center gap-2 pointer-events-auto transition active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Design Photorealistic Render</span>
          </button>
        )}

        <input ref={ifcFileInputRef} type="file" accept=".ifc,application/x-step" onChange={handleIfcFile} className="hidden" />
        <button
          type="button"
          onClick={() => ifcFileInputRef.current?.click()}
          className="ml-2 p-2 rounded-lg bg-[#0A0A0A]/95 border border-[#222222] text-gray-300 hover:text-[#2DD4BF] hover:border-[#2DD4BF]/50 pointer-events-auto transition"
          title="Import IFC model"
          aria-label="Import IFC model"
        >
          <Upload className="w-4 h-4" />
        </button>
        {hasImportedIfc && (
          <button
            type="button"
            onClick={clearIfcModel}
            className="ml-1 p-2 rounded-lg bg-[#0A0A0A]/95 border border-[#222222] text-gray-300 hover:text-rose-400 hover:border-rose-400/50 pointer-events-auto transition"
            title="Remove imported IFC model"
            aria-label="Remove imported IFC model"
          >
            <X className="w-4 h-4" />
          </button>
        )}

      </div>

      {ifcImportError && (
        <div role="alert" className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-md rounded-lg border border-rose-400/40 bg-[#0A0A0A]/95 px-3 py-2 text-xs text-rose-200 shadow-xl">
          {ifcImportError}
        </div>
      )}

      {/* LEFT FLOATING CONTROL DOCK (Camera Views, Weather System, Floor Isolation) */}
      <div className="absolute top-16 left-4 flex flex-col gap-2.5 pointer-events-none w-64 z-10">
        {/* 1. Camera View Presets */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-2.5 rounded-lg shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Camera className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Camera Perspective</span>
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1">
              {[
                { id: 'perspective', label: '3D Orbit' },
                { id: 'isometric', label: 'Axonometric' },
                { id: 'top', label: 'Roof / Plan' },
                { id: 'walkthrough', label: 'Walkthrough' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPresetView(item.id as any)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                    cameraView === item.id
                      ? 'bg-[#1E293B] text-[#2DD4BF] border border-[#2DD4BF]/40'
                      : 'bg-[#141414] text-gray-400 hover:text-white hover:bg-[#1A1A1A] border border-[#222]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Dedicated Interior & Exterior Vantage Shortcuts */}
            <div className="pt-1.5 border-t border-[#222] space-y-1">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">Vantage Perspectives</span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setPresetView('interior_living')}
                  className={`px-1.5 py-1 rounded text-[10px] font-medium transition text-center truncate ${
                    cameraView === 'interior_living'
                      ? 'bg-[#2DD4BF] text-black font-bold'
                      : 'bg-[#141414] text-gray-300 hover:text-white border border-[#222]'
                  }`}
                  title="Interior Living Room View"
                >
                  Int. Living
                </button>
                <button
                  onClick={() => setPresetView('interior_master')}
                  className={`px-1.5 py-1 rounded text-[10px] font-medium transition text-center truncate ${
                    cameraView === 'interior_master'
                      ? 'bg-[#2DD4BF] text-black font-bold'
                      : 'bg-[#141414] text-gray-300 hover:text-white border border-[#222]'
                  }`}
                  title="Interior Master Bedroom View"
                >
                  Int. Master
                </button>
                <button
                  onClick={() => setPresetView('exterior_pool')}
                  className={`px-1.5 py-1 rounded text-[10px] font-medium transition text-center truncate ${
                    cameraView === 'exterior_pool'
                      ? 'bg-[#2DD4BF] text-black font-bold'
                      : 'bg-[#141414] text-gray-300 hover:text-white border border-[#222]'
                  }`}
                  title="Exterior Pool & Facade View"
                >
                  Ext. Pool
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Weather Simulation System Selector */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-2.5 rounded-lg shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Cloud className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Weather Simulation</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">{activeWeatherConfig.ambientTempC}°C</span>
          </div>

          <div className="grid grid-cols-3 gap-1 mb-2">
            {(['clear', 'overcast', 'rain', 'snow', 'fog', 'wind'] as const).map((wKey) => {
              const w = WEATHER_PRESETS[wKey];
              const isSelected = activeWeather === wKey;
              return (
                <button
                  key={wKey}
                  onClick={() => setActiveWeather(wKey)}
                  className={`p-1.5 rounded flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                    isSelected
                      ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]'
                      : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222]'
                  }`}
                  title={w.description}
                >
                  {wKey === 'clear' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                  {wKey === 'overcast' && <Cloud className="w-3.5 h-3.5 text-gray-400" />}
                  {wKey === 'rain' && <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                  {wKey === 'snow' && <CloudSnow className="w-3.5 h-3.5 text-slate-200" />}
                  {wKey === 'fog' && <CloudFog className="w-3.5 h-3.5 text-teal-300" />}
                  {wKey === 'wind' && <Wind className="w-3.5 h-3.5 text-sky-400" />}
                  <span className="capitalize">{wKey}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-400 leading-tight bg-[#111] p-1.5 rounded border border-[#222]">
            {activeWeatherConfig.description}
          </div>
        </div>

        {/* 3. Level Isolation & Visibility Toggles */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-2.5 rounded-lg shadow-xl pointer-events-auto text-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-gray-300 font-medium text-[11px]">
              <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Storey Filter:</span>
            </span>
            <select
              value={isolatedLevel}
              onChange={(e) => setIsolatedLevel(e.target.value)}
              className="bg-[#141414] border border-[#333333] text-[#E0E0E0] rounded px-2 py-1 text-[11px] focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="all">All Storeys</option>
              {project.levels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-[#222] text-[11px] text-gray-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrees}
                onChange={(e) => setShowTrees(e.target.checked)}
                className="rounded accent-[#2DD4BF]"
              />
              <span>Trees & Site</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showFurniture}
                onChange={(e) => setShowFurniture(e.target.checked)}
                className="rounded accent-[#2DD4BF]"
              />
              <span>Furniture</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3D MODELING & VISUAL STYLE PALETTE */}
      <div className="absolute bottom-20 left-4 z-20 w-64 rounded-lg border border-[#222222] bg-[#0A0A0A]/95 p-2.5 shadow-xl backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-300">
          <span className="flex items-center gap-1.5"><Cuboid className="h-3.5 w-3.5 text-[#2DD4BF]" />3D Modeling</span>
          {userSolids.length > 0 && <button onClick={() => setUserSolids([])} className="text-rose-300 hover:text-rose-200" title="Erase all created solids"><Trash2 className="h-3.5 w-3.5" /></button>}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {([
            ['box', 'BOX', Box], ['cylinder', 'CYL', Circle], ['cone', 'CONE', Triangle], ['sphere', 'SPHERE', Circle], ['torus', 'TORUS', Circle], ['wedge', 'WEDGE', Triangle], ['pyramid', 'PYRAMID', Triangle],
          ] as const).map(([kind, label, Icon]) => <button key={kind} onClick={() => { setModelingTool(kind); addSolid(kind); }} title={`${label}: create ${kind} solid`} className={`flex flex-col items-center rounded border px-1 py-1.5 text-[9px] font-bold transition ${modelingTool === kind ? 'border-[#2DD4BF]/60 bg-[#2DD4BF]/15 text-[#2DD4BF]' : 'border-[#222] bg-[#141414] text-gray-400 hover:text-white'}`}><Icon className="h-3.5 w-3.5 mb-0.5" />{label}</button>)}
        </div>
        <div className="mt-2 border-t border-[#222] pt-2">
          <div className="mb-1 flex items-center gap-1 text-[9px] font-mono uppercase text-gray-500"><Palette className="h-3 w-3" /> Visual style</div>
          <div className="grid grid-cols-4 gap-1">{(['realistic', 'conceptual', 'wireframe', 'xray'] as const).map((style) => <button key={style} onClick={() => setVisualStyle(style)} className={`rounded py-1 text-[9px] capitalize ${visualStyle === style ? 'bg-[#2DD4BF] text-black font-bold' : 'bg-[#141414] text-gray-400 hover:text-white'}`}>{style}</button>)}</div>
        </div>
        <p className="mt-1.5 text-[9px] leading-snug text-gray-500">Primitives are placed as editable visualization solids. Use orbit, section cut, solar, materials, and capture controls to inspect the scene.</p>
      </div>

      {/* RIGHT FLOATING DOCK (Solar Position, Time Slider, Section Cut, Exploded Spacing) */}
      <div className="absolute top-16 right-4 flex flex-col gap-2.5 pointer-events-none w-72 z-10">
        {/* 1. Dynamic Sun & Diurnal Solar Cycle */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-3 rounded-lg shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1.5 text-[#2DD4BF] font-bold">
              <Sun className="w-4 h-4" />
              <span>Solar Sun & Shadow Study</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingSunLoop(!isPlayingSunLoop)}
                className="p-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded text-gray-300 transition"
                title={isPlayingSunLoop ? 'Pause Solar Loop' : 'Play 24h Solar Diurnal Cycle'}
              >
                {isPlayingSunLoop ? <Pause className="w-3 h-3 text-[#2DD4BF]" /> : <Play className="w-3 h-3 text-[#2DD4BF]" />}
              </button>
              <span className="font-mono text-[#E0E0E0] text-xs font-bold">
                {Math.floor(timeOfDay)}:{Math.floor((timeOfDay % 1) * 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <input
            type="range"
            min="6"
            max="22"
            step="0.25"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
          />
          <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
            <span>06:00 (Dawn)</span>
            <span>12:00 (Noon)</span>
            <span>18:00 (Sunset)</span>
            <span>22:00 (Night)</span>
          </div>

          {/* Real-time Solar Elevation & Azimuth Angle Readout */}
          <div className="mt-2 py-1 px-2 bg-[#141414] rounded border border-[#222] flex items-center justify-between text-[10px] font-mono">
            <span className="text-gray-400">
              Solar Alt: <strong className="text-amber-400">{Math.max(0, Math.round(Math.cos(((timeOfDay - 12) / 12) * Math.PI) * 65))}°</strong>
            </span>
            <span className="text-gray-400">
              Azimuth: <strong className="text-cyan-400">{Math.round(((timeOfDay - 6) / 12) * 180 + project.site.orientationNorthDeg) % 360}°</strong>
            </span>
          </div>

          {/* Quick Diurnal Time Jumps */}
          <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#222]">
            {[
              { label: 'Dawn', time: 6.5 },
              { label: 'Noon', time: 12.0 },
              { label: 'Golden', time: 17.5 },
              { label: 'Dusk', time: 19.5 },
              { label: 'Night', time: 22.0 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setTimeOfDay(preset.time)}
                className="px-2 py-0.5 bg-[#141414] hover:bg-[#222] rounded text-[10px] text-gray-300 font-medium transition"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Scenario-Specific Adjusters (Exploded Spacing or Section Cut) */}
        {activeScenario === 'exploded_bim' ? (
          <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-3 rounded-lg shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between text-xs mb-1.5 text-pink-400 font-bold">
              <div className="flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Exploded Floor Spacing</span>
              </div>
              <span className="font-mono text-white text-xs">{explodedSpacing.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={explodedSpacing}
              onChange={(e) => setExplodedSpacing(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-pink-400"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
              <span>1.0m (Compact)</span>
              <span>10.0m (Expanded)</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-3 rounded-lg shadow-xl pointer-events-auto">
            <div className="flex items-center justify-between text-xs mb-1.5 text-cyan-400 font-bold">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5" />
                <span>Section Cut Height</span>
              </div>
              <span className="font-mono text-white text-xs">
                {sectionCutHeight >= 14 ? 'Full (No Cut)' : `${sectionCutHeight.toFixed(1)}m`}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.5"
              value={sectionCutHeight}
              onChange={(e) => setSectionCutHeight(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[9px] text-gray-500 font-mono mt-1">
              <span>0.5m (Ground)</span>
              <span>7.5m (Mid-Level)</span>
              <span>15m (Full Model)</span>
            </div>
          </div>
        )}

        {/* 3. Real-Time Physical Metrics Telemetry Box */}
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] p-2.5 rounded-lg shadow-xl pointer-events-auto text-[11px] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-gray-400 font-semibold border-b border-[#222] pb-1">
            <span className="flex items-center gap-1 text-gray-300">
              <Gauge className="w-3 h-3 text-[#2DD4BF]" />
              <span>BIM Physical Telemetry</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#141414] text-[#2DD4BF] font-mono">LIVE</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <div className="bg-[#111] p-1.5 rounded border border-[#222] flex flex-col">
              <span className="text-gray-500 text-[9px]">Solar Insolation</span>
              <span className="text-amber-400 font-bold">
                {timeOfDay >= 6.5 && timeOfDay <= 18.5 ? `${Math.round(840 * (activeWeatherConfig.sunIntensity / 2.4))} W/m²` : '0 W/m²'}
              </span>
            </div>
            <div className="bg-[#111] p-1.5 rounded border border-[#222] flex flex-col">
              <span className="text-gray-500 text-[9px]">Wind Velocity</span>
              <span className="text-sky-400 font-bold">{activeWeatherConfig.windSpeedMs} m/s SSE</span>
            </div>
            <div className="bg-[#111] p-1.5 rounded border border-[#222] flex flex-col">
              <span className="text-gray-500 text-[9px]">Exterior Illuminance</span>
              <span className="text-emerald-400 font-bold">
                {timeOfDay >= 6.5 && timeOfDay <= 18.5 ? `${Math.round(75000 * (activeWeatherConfig.sunIntensity / 2.4))} Lux` : '180 Lux'}
              </span>
            </div>
            <div className="bg-[#111] p-1.5 rounded border border-[#222] flex flex-col">
              <span className="text-gray-500 text-[9px]">Site Orientation</span>
              <span className="text-purple-400 font-bold">{project.site.orientationNorthDeg}° North</span>
            </div>
          </div>
        </div>

        {/* 4. Snapshot Exporter Button */}
        <button
          onClick={handleCaptureSnapshot}
          disabled={isCapturing}
          className="bg-[#141414] hover:bg-[#1E1E1E] text-gray-200 border border-[#333] hover:border-[#2DD4BF] text-xs font-semibold py-2 px-3 rounded-lg shadow-lg flex items-center justify-center gap-2 pointer-events-auto transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-[#2DD4BF]" />
          <span>{isCapturing ? 'Capturing High-Res...' : 'Capture 4K BIM Snapshot'}</span>
        </button>
      </div>

      {/* WALKTHROUGH MODE HUD OVERLAY */}
      {cameraView === 'walkthrough' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center">
          {/* Aim Crosshair */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-[#2DD4BF]/80" />
            <div className="h-3 w-0.5 bg-[#2DD4BF]/80 absolute" />
            <div className="w-1.5 h-1.5 rounded-full border border-[#2DD4BF] absolute" />
          </div>
          {/* Walkthrough Controls Pill */}
          <div className="mt-4 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#2DD4BF]/40 px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-[11px] font-mono text-gray-200">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
            <span>WASD: Walk • Q/E: Elevate • Shift: Sprint • Left-drag: Look Around</span>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING STATUS & SCENARIO BADGE */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Active Scenario Info Badge */}
        <div className="bg-[#0A0A0A]/95 backdrop-blur-md border border-[#222222] px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-3 pointer-events-auto max-w-xl">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: activeScenarioConfig.colorHex }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{activeScenarioConfig.title}</span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase"
                style={{
                  backgroundColor: `${activeScenarioConfig.colorHex}20`,
                  color: activeScenarioConfig.colorHex,
                  border: `1px solid ${activeScenarioConfig.colorHex}40`,
                }}
              >
                {activeScenarioConfig.badge}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 line-clamp-1">{activeScenarioConfig.description}</span>
          </div>
        </div>

        {/* Right: Orbit Navigation Helper & Official Letterhead Brand Watermark */}
        <div className="flex items-center gap-3">
          <div className="bg-[#05070B]/90 backdrop-blur-md border border-[#2DD4BF]/40 px-2.5 py-1 rounded-lg flex items-center gap-2 pointer-events-none shadow-xl font-mono">
            <div className="w-5 h-5 flex items-center justify-center">
              <img
                src={APP_LOGO}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                }}
                alt="Brand Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[10px]">
              <span className="text-white font-bold">{project.companyName || 'LORA ARCHITECTS'}</span>
              <span className="text-gray-400 block text-[9px]">{project.name} • 3D BIM</span>
            </div>
          </div>

          <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-[#222222] px-3 py-1.5 rounded-lg text-[11px] text-gray-400 font-mono pointer-events-none hidden md:block">
            Left-drag: <strong className="text-gray-200">Orbit 3D</strong> • Right-drag: <strong className="text-gray-200">Pan</strong> • Scroll: <strong className="text-gray-200">Zoom</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
