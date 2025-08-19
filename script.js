// Geometric Visualization — Plus
// Canvas drawing engine + recording + PNG save
(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  const ui = {
    pattern: document.getElementById('pattern'),
    lineWidth: document.getElementById('lineWidth'),
    speed: document.getElementById('speed'),
    k: document.getElementById('k'),
    a: document.getElementById('a'),
    b: document.getElementById('b'),
    colorMode: document.getElementById('colorMode'),
    fade: document.getElementById('fade'),
    bg: document.getElementById('bg'),
    resolution: document.getElementById('resolution'),
    fps: document.getElementById('fps'),
    duration: document.getElementById('duration'),
    seed: document.getElementById('seed'),
    savePngBtn: document.getElementById('savePngBtn'),
    recordBtn: document.getElementById('recordBtn'),
    randomizeBtn: document.getElementById('randomizeBtn'),
    resetBtn: document.getElementById('resetBtn'),
    status: document.getElementById('status'),
  };

  // Resize canvas according to selected resolution and container size
  function resize() {
    const stage = canvas.parentElement.getBoundingClientRect();
    const res = parseInt(ui.resolution.value, 10);
    const targetH = res;
    const targetW = Math.min(stage.width, stage.height * (16/9)) * dpr;
    const aspect = 16/9;
    const h = targetH * dpr;
    const w = h * aspect;
    const finalW = Math.min(targetW, w);
    const finalH = finalW / aspect;
    canvas.width = Math.max(640, Math.floor(finalW));
    canvas.height = Math.max(360, Math.floor(finalH));
  }
  window.addEventListener('resize', resize);

  // PRNG with seed
  let seed = 0;
  function srand(s) { seed = s >>> 0; }
  function rand() {
    // xorshift32
    let x = seed || 123456789;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    seed = x >>> 0;
    return (seed % 1000000) / 1000000;
  }

  // Helpers
  function hsla(h, s, l, a=1){ return `hsla(${h}, ${s}%, ${l}%, ${a})`; }

  let t = 0;
  let last = 0;
  let rafId = 0;

  function clearCanvas() {
    ctx.fillStyle = ui.bg.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function colorFor(i, total) {
    const mode = ui.colorMode.value;
    const p = (i / Math.max(1,total)) * 360;
    switch(mode){
      case 'mono': return hsla(210, 10, 88, 1);
      case 'duo': return hsla((p*0.5)%360, 80, 60, 1);
      case 'rainbow': return hsla((p*2)%360, 90, 60, 1);
      default: return hsla((p + t*12)%360, 80, 60, 1);
    }
  }

  function lissajous(a, b, k) {
    const cx = canvas.width/2, cy = canvas.height/2;
    const steps = 1200;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++){
      const u = i / steps * Math.PI * 2;
      const x = cx + a * Math.sin(k * u + t*0.6) * Math.cos(u);
      const y = cy + b * Math.cos(u + t*0.5);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = colorFor(steps, steps);
    ctx.lineWidth = parseFloat(ui.lineWidth.value);
    ctx.stroke();
  }

  function rose(a, k){
    const cx = canvas.width/2, cy = canvas.height/2;
    const steps = 1600;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++){
      const u = i / steps * Math.PI * 2;
      const r = a * Math.cos(k * u + t*0.5);
      const x = cx + r * Math.cos(u);
      const y = cy + r * Math.sin(u);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = colorFor(steps, steps);
    ctx.lineWidth = parseFloat(ui.lineWidth.value);
    ctx.stroke();
  }

  function spiro(a, b, k){
    // Hypotrochoid/Epitrochoid style
    const cx = canvas.width/2, cy = canvas.height/2;
    const steps = 2500;
    const R = a;
    const r = Math.max(1, Math.min(a-1, b));
    const d = Math.max(1, b/2);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++){
      const u = i / steps * Math.PI * 2;
      const x = cx + (R - r) * Math.cos(u) + d * Math.cos(((R - r) / r) * u + t*0.3);
      const y = cy + (R - r) * Math.sin(u) - d * Math.sin(((R - r) / r) * u + t*0.3);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = colorFor(steps, steps);
    ctx.lineWidth = parseFloat(ui.lineWidth.value);
    ctx.stroke();
  }

  function orbit(a, b, k){
    const cx = canvas.width/2, cy = canvas.height/2;
    const steps = 1200;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++){
      const u = i / steps * Math.PI * 2;
      const r = a * 0.5 + (a * 0.5) * Math.sin(k*u + t*ui.speed.value);
      const x = cx + r * Math.cos(u + t*0.2) + Math.sin(t*0.7) * b * 0.25;
      const y = cy + r * Math.sin(u + t*0.2) + Math.cos(t*0.7) * b * 0.25;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = colorFor(steps, steps);
    ctx.lineWidth = parseFloat(ui.lineWidth.value);
    ctx.stroke();
  }

  function draw() {
    const now = performance.now();
    const dt = Math.min(32, now - last) / 1000; // clamp delta
    last = now;
    t += dt * parseFloat(ui.speed.value);

    if (ui.fade.checked){
      ctx.fillStyle = ui.bg.value + (ui.bg.value.length === 7 ? 'cc' : '');
      ctx.fillRect(0,0,canvas.width, canvas.height);
    } else {
      clearCanvas();
    }

    const a = parseFloat(ui.a.value);
    const b = parseFloat(ui.b.value);
    const k = parseInt(ui.k.value,10);

    switch(ui.pattern.value){
      case 'lissajous': lissajous(a, b, k); break;
      case 'rose': rose(a, k); break;
      case 'spiro': spiro(a, b, k); break;
      case 'orbit': orbit(a, b, k); break;
    }

    ui.status.textContent = \`\${canvas.width}×\${canvas.height} @ \${ui.fps.value}fps | t=\${t.toFixed(2)}\`;
    rafId = requestAnimationFrame(draw);
  }

  function start() {
    resize();
    srand(parseInt(ui.seed.value,10) || 0);
    clearCanvas();
    cancelAnimationFrame(rafId);
    last = performance.now();
    rafId = requestAnimationFrame(draw);
  }

  // Actions
  ui.savePngBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'geometric-frame.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  ui.recordBtn.addEventListener('click', async () => {
    const fps = parseInt(ui.fps.value, 10);
    const duration = Math.max(1, parseInt(ui.duration.value, 10) || 7);
    const stream = canvas.captureStream(fps);
    const chunks = [];
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const stamp = new Date().toISOString().replace(/[:.]/g,'-');
      a.download = \`geometric-\${ui.pattern.value}-\${stamp}.webm\`;
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url), 5000);
      ui.recordBtn.disabled = false;
      ui.recordBtn.textContent = 'Record 7s WEBM';
    };
    rec.start();
    ui.recordBtn.disabled = true;
    ui.recordBtn.textContent = 'Recording…';
    setTimeout(() => rec.stop(), duration * 1000);
  });

  ui.randomizeBtn.addEventListener('click', () => {
    ui.pattern.value = ['lissajous','rose','spiro','orbit'][Math.floor(Math.random()*4)];
    ui.lineWidth.value = (Math.random()*6 + 0.5).toFixed(1);
    ui.speed.value = (Math.random()*2.5 + 0.2).toFixed(1);
    ui.k.value = Math.floor(Math.random()*14)+1;
    ui.a.value = Math.floor(Math.random()*250)+50;
    ui.b.value = Math.floor(Math.random()*250)+20;
    ui.colorMode.value = ['hsla','mono','duo','rainbow'][Math.floor(Math.random()*4)];
    ui.bg.value = '#'+Math.floor(rand()*0xFFFFFF).toString(16).padStart(6,'0');
    start();
  });

  ui.resetBtn.addEventListener('click', () => {
    ui.pattern.value = 'lissajous';
    ui.lineWidth.value = 2;
    ui.speed.value = 1.0;
    ui.k.value = 7;
    ui.a.value = 180;
    ui.b.value = 75;
    ui.colorMode.value = 'hsla';
    ui.fade.checked = true;
    ui.bg.value = '#0b0b10';
    ui.resolution.value = '720';
    ui.fps.value = '30';
    ui.duration.value = '7';
    ui.seed.value = '0';
    start();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') ui.recordBtn.click();
    if (e.key === ' ') { e.preventDefault(); ui.randomizeBtn.click(); }
    if (e.key.toLowerCase() === 's') ui.savePngBtn.click();
  });

  // Wire UI changes
  Object.values(ui).forEach(el => {
    if (!el || !('addEventListener' in el)) return;
    el.addEventListener('change', start);
    el.addEventListener('input', (evt)=>{
      if (['lineWidth','speed','k','a','b','bg','colorMode','pattern','fade'].includes(evt.target.id)){
        // live tweak
      }
    });
  });

  // Init
  start();
})();
