import VenusSurfaceSimulator from "./VenusSurfaceSimulator";
import venusTextureImage from "/src/assets/venus.jpg";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Search, Menu, Compass, Crosshair, MapPin, Rocket, Info, ZoomIn, ZoomOut, RotateCcw, EyeOff, Play, Pause } from "lucide-react";

export default function PathToVenusWeek1Globe() {
    const linkHubItems = [
    {
      label: "Buy the Book",
      subtitle: "Get your copy on Amazon",
      href: "https://a.co/d/0iIg703u",
      icon: "📖",
    },
    {
      label: "Shop T-Shirts",
      subtitle: "Official Path to Venus merch",
      href: "PASTE_YOUR_TSHIRT_LINK_HERE",
      icon: "👕",
    },
    {
      label: "YouTube",
      subtitle: "Watch videos and deep dives",
      href: "PASTE_YOUR_YOUTUBE_LINK_HERE",
      icon: "▶",
    },
    {
      label: "Instagram",
      subtitle: "Updates, visuals, and behind the scenes",
      href: "PASTE_YOUR_INSTAGRAM_LINK_HERE",
      icon: "◎",
    },
    {
      label: "TikTok",
      subtitle: "Shorts, clips, and Venus content",
      href: "PASTE_YOUR_TIKTOK_LINK_HERE",
      icon: "♪",
    },
  ];
  const mountRef = useRef(null);
  const sphereRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousPointerRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const [cinematic, setCinematic] = useState(true);
  const [uiHidden, setUiHidden] = useState(false);
  const [zoom, setZoom] = useState(window.innerWidth < 768 ? 7.2 : 4.2);
  const [selected, setSelected] = useState({
    name: "Planned Rover Landing Site",
    type: "Mission Target",
    description: "Our target for the first Path to Venus rover mission.",
  });

  const locations = useMemo(
    () => [
      { name: "Venera Prime", type: "Future Cloud City", x: "50%", y: "32%" },
      { name: "Maxwell Montes", type: "Mountain Range", x: "36%", y: "36%" },
      { name: "Maat Mons", type: "Shield Volcano", x: "31%", y: "64%" },
      { name: "Aphrodite Terra", type: "Highland Region", x: "62%", y: "52%" },
      { name: "Lakshmi Planum", type: "Volcanic Plain", x: "64%", y: "37%" },
      { name: "Ishtar Terra", type: "Highland Region", x: "72%", y: "60%" },
      { name: "Planned Rover Landing Site", type: "Mission Target", x: "46%", y: "56%", mission: true },
    ],
    []
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = zoom;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1400;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 80;
      positions[i + 2] = -Math.random() * 70;
    }
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.85 })
    );
    scene.add(stars);

    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#f6b845");
    gradient.addColorStop(0.35, "#9f5b14");
    gradient.addColorStop(0.7, "#4b2308");
    gradient.addColorStop(1, "#d8912d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Fake Venus radar/cloud texture: simple procedural streaks and swirls.
    for (let i = 0; i < 520; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 40 + Math.random() * 280;
      const alpha = 0.025 + Math.random() * 0.08;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * (0.08 + Math.random() * 0.18), Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 217, 127, ${alpha})`;
      ctx.lineWidth = 2 + Math.random() * 8;
      ctx.stroke();
    }
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 10 + Math.random() * 55;
      const grd = ctx.createRadialGradient(x, y, 2, x, y, r);
      grd.addColorStop(0, "rgba(255,230,160,.22)");
      grd.addColorStop(1, "rgba(255,230,160,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const textureLoader = new THREE.TextureLoader();
    const venusTexture = textureLoader.load(venusTextureImage);
    venusTexture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(1.55, 96, 96);
    const material = new THREE.MeshStandardMaterial({
      map: venusTexture,
      roughness: 0.9,
      metalness: 0.02,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.rotation.y = -0.45;
    sphere.rotation.x = 0.15;
    sphereRef.current = sphere;
    scene.add(sphere);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.59, 96, 96),
      new THREE.MeshBasicMaterial({ color: 0xf3a83a, transparent: true, opacity: 0.13, side: THREE.BackSide })
    );
    scene.add(atmosphere);

    const keyLight = new THREE.DirectionalLight(0xffd187, 3.5);
    keyLight.position.set(-3, 2, 5);
    scene.add(keyLight);
    const fillLight = new THREE.AmbientLight(0xffa43a, 0.8);
    scene.add(fillLight);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const pointerDown = (e) => {
      isDraggingRef.current = true;
      setCinematic(false);
      previousPointerRef.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.setPointerCapture?.(e.pointerId);
    };
    const pointerMove = (e) => {
      if (!isDraggingRef.current || !sphereRef.current) return;
      const dx = e.clientX - previousPointerRef.current.x;
      const dy = e.clientY - previousPointerRef.current.y;
      sphereRef.current.rotation.y += dx * 0.006;
      sphereRef.current.rotation.x += dy * 0.004;
      velocityRef.current = { x: dx * 0.0009, y: dy * 0.0007 };
      previousPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    const pointerUp = () => {
      isDraggingRef.current = false;
    };
    const wheel = (e) => {
      e.preventDefault();
      const next = Math.max(2.35, Math.min(6.2, camera.position.z + e.deltaY * 0.002));
      camera.position.z = next;
      setZoom(next);
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointerleave", pointerUp);
    renderer.domElement.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("resize", onResize);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      if (sphereRef.current) {
        if (cinematic) sphereRef.current.rotation.y += 0.0017;
        if (!isDraggingRef.current) {
          sphereRef.current.rotation.y += velocityRef.current.x;
          sphereRef.current.rotation.x += velocityRef.current.y;
          velocityRef.current.x *= 0.94;
          velocityRef.current.y *= 0.94;
        }
      }
      stars.rotation.y += 0.00008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointerleave", pointerUp);
      renderer.domElement.removeEventListener("wheel", wheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (venusTexture) venusTexture.dispose();
      starGeometry.dispose();
    };
  }, [cinematic]);

  useEffect(() => {
    if (cameraRef.current) cameraRef.current.position.z = zoom;
  }, [zoom]);

  const changeZoom = (amount) => {
    setZoom((z) => Math.max(2.35, Math.min(6.2, z + amount)));
  };

  const resetView = () => {
    setCinematic(true);
    setZoom(4.2);
    if (sphereRef.current) {
      sphereRef.current.rotation.set(0.15, -0.45, 0);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-sans select-none">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_20%,rgba(0,0,0,.15)_55%,rgba(0,0,0,.75)_100%)] pointer-events-none" />


      {!uiHidden && (
        <>
          <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-5 md:p-7">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-black text-amber-400 tracking-tight">V</div>
              <div>
                <div className="text-2xl font-bold tracking-widest">PATH TO VENUS</div>
                <div className="text-[11px] text-amber-300 tracking-[0.2em]">EXPLORING VENUS. BUILDING THE FUTURE.</div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3 w-[420px] rounded-full bg-white/8 border border-white/15 px-5 py-3 backdrop-blur-md shadow-2xl">
              <Search size={20} className="text-white/65" />
              <span className="text-white/55">Search Venus...</span>
            </div>
            <button className="rounded-full bg-white/8 border border-white/15 p-3 backdrop-blur-md">
              <Menu size={24} />
            </button>
          </header>

          <aside className="absolute left-5 top-32 z-20 hidden lg:block w-72 rounded-2xl bg-black/55 border border-white/15 backdrop-blur-md p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold mb-4"><Info size={18} /> PLANET INFO</div>
            <div className="space-y-4 text-sm text-white/85">
              <div>Mean Radius<br /><span className="text-white font-semibold">6,052 km</span></div>
              <div>Rotation Period<br /><span className="text-white font-semibold">243 Earth days</span></div>
              <div>Surface Temperature<br /><span className="text-white font-semibold">462°C</span></div>
              <div>Atmospheric Pressure<br /><span className="text-white font-semibold">92× Earth</span></div>
            </div>
            <button className="mt-5 w-full rounded-xl border border-amber-400/70 px-4 py-3 text-amber-300 font-bold text-sm">LEARN MORE</button>
          </aside>

          <div className="absolute right-5 top-36 z-20 flex flex-col gap-4">
            <RoundButton icon={<Compass />} />
            <RoundButton icon={<Crosshair />} />
            <RoundButton icon={cinematic ? <Pause /> : <Play />} onClick={() => setCinematic(!cinematic)} />
            <RoundButton icon={<ZoomIn />} onClick={() => changeZoom(-0.35)} />
            <RoundButton icon={<ZoomOut />} onClick={() => changeZoom(0.35)} />
            <RoundButton label="3D" />
          </div>

          <main className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-[17%] left-1/2 -translate-x-1/2 text-center hidden md:block">
              <div className="text-3xl font-bold tracking-[0.25em]">EXPLORE VENUS</div>
              <div className="mt-3 mx-auto h-1 w-20 bg-amber-400 rounded-full" />
              <p className="mt-5 text-white/78 max-w-md text-lg">Move the planet with your fingers. Zoom in. Create cinematic Venus footage for the mission.</p>
            </div>

           {locations.map((loc) => (
  <button
    key={loc.name}
    onClick={() =>
      setSelected({
        name: loc.name,
        type: loc.type,
        description: loc.mission
          ? "Our target for the first Path to Venus rover mission."
          : `Explore ${loc.name}, a major Venus ${loc.type.toLowerCase()}.`,
      })
    }
    className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 group ${
      loc.mission ? "z-30" : "z-20"
    }`}
    style={{ left: loc.x, top: loc.y }}
  >
    <span
      className={`inline-flex items-center justify-center rounded-full ${
        loc.mission
          ? "w-12 h-12 bg-red-500 shadow-[0_0_35px_rgba(255,180,30,.9)]"
          : "w-3 h-3 bg-amber-200"
      } border-2 border-white/80`}
    >
      {loc.mission && <Rocket size={22} />}
    </span>

    <span
      className={`hidden md:inline-block ml-2 align-middle rounded-lg bg-black/65 border ${
        loc.mission
          ? "border-amber-400/70 text-amber-300"
          : "border-white/15 text-white"
      } px-3 py-2 text-left text-sm font-semibold shadow-xl backdrop-blur-sm`}
    >
      {loc.name}
      <br />
      <span className="font-normal text-white/75">{loc.type}</span>
    </span>
  </button>
))}
          </main>

          <section className="hidden md:block absolute bottom-0 md:bottom-24 left-1/2 -translate-x-1/2 z-30 w-[92%] md:w-[min(760px,calc(100%-2rem))] rounded-2xl bg-black/70 border border-white/15 backdrop-blur-lg p-4 md:p-5 shadow-2xl">
            <div className="flex gap-4 items-center">
              <div className="hidden sm:block w-40 h-24 rounded-xl bg-gradient-to-br from-amber-200 via-amber-700 to-black border border-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-red-300 text-xs font-bold tracking-widest"><MapPin size={15} /> {selected.type.toUpperCase()}</div>
                <h2 className="text-2xl font-bold mt-1">{selected.name}</h2>
                <p className="text-white/78 mt-2">{selected.description}</p>
              </div>
              <button className="hidden md:block rounded-xl border border-amber-400/70 px-5 py-3 text-amber-300 font-bold">Learn More</button>
            </div>
          </section>

                <footer className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pointer-events-none">
        <div className="mx-auto w-full max-w-md pointer-events-auto">

          {/* Mobile Link Hub */}
          <div className="md:hidden rounded-[2rem] border border-amber-400/25 bg-black/70 p-4 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-black tracking-[0.18em] text-white">
                PATH TO <span className="text-amber-400">VENUS</span>
              </h1>

              <p className="mt-2 text-xs font-medium tracking-[0.22em] text-amber-300/90">
                EXPLORING VENUS. BUILDING THE FUTURE.
              </p>
            </div>

            <div className="space-y-3">
              {linkHubItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-black/80 to-amber-950/25 px-4 py-3 transition-all duration-300 hover:border-amber-300 hover:bg-amber-400/10 active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-300/40 bg-black/60 text-2xl shadow-inner shadow-amber-500/10">
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-bold text-white">
                      {item.label}
                    </div>

                    <div className="truncate text-sm text-amber-200/80">
                      {item.subtitle}
                    </div>
                  </div>

                  <div className="text-3xl font-light text-amber-300 transition-transform duration-300 group-hover:translate-x-1">
                    ›
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-5 text-center">
              <p className="text-[10px] font-bold tracking-[0.28em] text-amber-300/70">
                TOGETHER, WE CAN REACH FOR VENUS.
              </p>

              <div className="mx-auto mt-3 h-px w-32 bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

              <div className="mt-2 text-2xl font-black text-amber-400">
                V
              </div>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:flex items-center justify-center gap-8">
            <a
              href="https://a.co/d/0iIg703u"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 font-bold hover:text-amber-200 transition-colors"
            >
              BUY THE PATH TO VENUS BOOK ON AMAZON
            </a>

            <div className="text-xs md:text-sm text-white/70">
              BUILDING THE FUTURE ABOVE VENUS
            </div>
          </div>
        </div>
      </footer>
        </>
      )}

      <button
        onClick={() => setUiHidden(!uiHidden)}
        className="hidden md:block absolute left-5 bottom-24 z-40 rounded-full bg-black/70 border border-white/15 p-4 backdrop-blur-md text-white hover:bg-white/10"
        title="Hide UI for cinematic recording"
      >
        <EyeOff size={22} />
      </button>
      <button
        onClick={resetView}
        className="hidden md:block absolute left-5 bottom-24 z-40 rounded-full bg-black/70 border border-white/15 p-4 backdrop-blur-md text-white hover:bg-white/10"
        title="Reset view"
      >
        <RotateCcw size={22} />
      </button>
    </div>
  );
}

function RoundButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-14 h-14 rounded-full bg-black/60 border border-white/15 backdrop-blur-md flex items-center justify-center shadow-xl text-white/90 hover:bg-white/10 font-bold">
      {icon || label}
    </button>
  );
}
