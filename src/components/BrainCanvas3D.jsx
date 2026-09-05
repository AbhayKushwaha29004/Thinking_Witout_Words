import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Stars, Float, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';

// Floating neuron node
function Neuron({ position, color, size = 0.07, speed = 1, active = false, delay = 0 }) {
  const meshRef = useRef();
  const trailRef = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + delay;
    if (meshRef.current) {
      meshRef.current.position.x = position[0] + Math.sin(t * speed * 0.4) * 0.08;
      meshRef.current.position.y = position[1] + Math.cos(t * speed * 0.3) * 0.06;
      meshRef.current.position.z = position[2] + Math.sin(t * speed * 0.5) * 0.05;
      if (active) {
        meshRef.current.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.4;
        const s = 1 + Math.sin(t * 3 + delay) * 0.15;
        meshRef.current.scale.setScalar(s);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 10, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={active ? 0.7 : 0.15}
        roughness={0.2}
        metalness={0.7}
        transparent
        opacity={active ? 0.95 : 0.6}
      />
    </mesh>
  );
}

// Synaptic connection pulse
function SynapsePulse({ start, end, color, speed = 1, delay = 0 }) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const pulseRef = useRef();

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = (clock.getElapsedTime() * speed + delay) % 1;
      const pos = new THREE.Vector3(...start).lerp(new THREE.Vector3(...end), t);
      pulseRef.current.position.copy(pos);
      pulseRef.current.material.opacity = Math.sin(t * Math.PI) * 0.9;
    }
  });

  return (
    <group>
      <line geometry={lineGeo}>
        <lineBasicMaterial color={color} transparent opacity={0.12} />
      </line>
      <mesh ref={pulseRef} position={start}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Core brain sphere with rings
function BrainCore({ iterations }) {
  const meshRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const intensity = Math.min(iterations / 20, 1);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
      meshRef.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    }
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.3;
      ring1.current.rotation.x = t * 0.1 + 0.5;
    }
    if (ring2.current) {
      ring2.current.rotation.z = -t * 0.2;
      ring2.current.rotation.y = t * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
      <group>
        {/* Inner core */}
        <Sphere ref={meshRef} args={[0.85, 80, 80]}>
          <MeshDistortMaterial
            color="#6d28d9"
            emissive="#4c1d95"
            emissiveIntensity={0.25 + intensity * 0.55}
            roughness={0.05}
            metalness={0.9}
            distort={0.12 + intensity * 0.22}
            speed={1.5 + intensity * 3}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Outer glow shell */}
        <Sphere args={[0.97, 32, 32]}>
          <meshStandardMaterial
            color="#7c3aed"
            emissive="#5b21b6"
            emissiveIntensity={0.08 + intensity * 0.15}
            roughness={1}
            transparent
            opacity={0.06 + intensity * 0.08}
            side={THREE.BackSide}
          />
        </Sphere>

        {/* Orbital rings */}
        <Torus ref={ring1} args={[1.35, 0.008, 6, 80]}>
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.25 + intensity * 0.3} />
        </Torus>
        <Torus ref={ring2} args={[1.6, 0.005, 6, 80]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.15 + intensity * 0.25} />
        </Torus>
      </group>
    </Float>
  );
}

// Full neuron constellation
function NeuronCloud({ iterations }) {
  const neurons = useMemo(() => {
    const items = [];
    // Use fibonacci sphere for even distribution
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < 32; i++) {
      const y = 1 - (i / 31) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const radius = 1.45 + (i % 5) * 0.2;
      items.push({
        id: i,
        pos: [r * Math.cos(theta) * radius, y * radius, r * Math.sin(theta) * radius],
        color: i % 4 === 0 ? '#22d3ee' : i % 4 === 1 ? '#a78bfa' : i % 4 === 2 ? '#34d399' : '#f472b6',
        size: 0.035 + (i % 3) * 0.025,
        speed: 0.4 + (i % 5) * 0.2,
        delay: i * 0.4,
      });
    }
    return items;
  }, []);

  const activeCount = Math.floor((iterations / 20) * neurons.length * 0.35 + 3);

  // Synapse connections between nearby neurons
  const synapses = useMemo(() => {
    const conns = [];
    for (let i = 0; i < 18; i++) {
      const j = (i + 3 + (i % 4)) % neurons.length;
      conns.push({
        start: neurons[i].pos,
        end: neurons[j].pos,
        color: i % 2 === 0 ? '#7c3aed' : '#06b6d4',
        speed: 0.4 + Math.random() * 0.4,
        delay: i * 0.35,
      });
    }
    return conns;
  }, [neurons]);

  return (
    <group>
      {neurons.map((n, i) => (
        <Neuron
          key={n.id}
          position={n.pos}
          color={n.color}
          size={n.size}
          speed={n.speed}
          active={i < activeCount}
          delay={n.delay}
        />
      ))}
      {synapses.map((s, i) => (
        <SynapsePulse
          key={i}
          start={s.start}
          end={s.end}
          color={s.color}
          speed={s.speed}
          delay={s.delay}
        />
      ))}
    </group>
  );
}

// Point light that orbits
function OrbitLight({ radius = 3, color = '#7c3aed', speed = 0.5, height = 1 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radius;
      ref.current.position.z = Math.sin(t) * radius;
      ref.current.position.y = height + Math.sin(t * 0.7) * 0.5;
    }
  });
  return <pointLight ref={ref} color={color} intensity={1.2} distance={6} />;
}

export default function BrainCanvas3D({ iterations = 1, height = 420 }) {
  return (
    <div style={{ width: '100%', height, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 48 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} color="#1a0a3a" />
        <OrbitLight radius={3.5} color="#7c3aed" speed={0.35} height={1.5} />
        <OrbitLight radius={3} color="#06b6d4" speed={-0.25} height={-1} />
        <pointLight position={[0, 0, 3]} color="#fff" intensity={0.4} />

        <Stars radius={60} depth={40} count={1200} factor={2.5} fade speed={0.4} />

        <BrainCore iterations={iterations} />
        <NeuronCloud iterations={iterations} />
      </Canvas>
    </div>
  );
}
