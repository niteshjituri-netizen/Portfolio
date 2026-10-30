/**
 * Nitesh Jituri Portfolio - Interactive CNC G-Code Toolpath Simulator
 * Canvas-based Real-time Turning & Milling Path Visualizer
 */

class CNCSimulator {
  constructor() {
    this.canvas = document.getElementById('cncCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.isRunning = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.progress = 0;
    this.speed = 1.0;
    this.animationId = null;

    // Active tool position
    this.pos = { x: 0, y: 0, z: 5 };
    this.targetPos = { x: 0, y: 0, z: 5 };
    this.spindleRPM = 0;
    this.feedRate = 0;
    this.activeG = 'G00';

    // Toolpath history for drawing
    this.cutPath = [];
    this.chips = [];

    // Preset CNC Programs
    this.programs = {
      turning_step: {
        type: 'turning',
        name: 'CNC Lathe: Step Turning & Chamfer',
        stock: { length: 220, diameter: 80 },
        code: [
          'O1001 (STEP TURNING OPERATION)',
          'G21 G90 G40 (METRIC ABSOLUTE)',
          'G28 U0 W0 (HOME POSITION)',
          'T0101 (ROUGHING TOOL R0.8)',
          'G96 S220 M03 (CONST SURFACE SPEED)',
          'G00 X85.0 Z2.0 M08 (RAPID APPROACH)',
          'G01 X50.0 Z2.0 F0.2 (POSITION CUT)',
          'G01 Z-45.0 F0.18 (TURN DIA 50mm)',
          'G01 X70.0 Z-45.0 (STEP OUT)',
          'G01 Z-90.0 (TURN DIA 70mm)',
          'G01 X82.0 (CLEAR WORKPIECE)',
          'G00 X120.0 Z50.0 (RETRACT)',
          'M09 (COOLANT OFF)',
          'M05 (SPINDLE STOP)',
          'M30 (PROGRAM END)'
        ],
        steps: [
          { g: 'G28', x: 120, z: 50, rpm: 0, f: 0, active: 2 },
          { g: 'G96', x: 120, z: 50, rpm: 1800, f: 0, active: 4 },
          { g: 'G00', x: 85, z: 2, rpm: 1800, f: 0, active: 5 },
          { g: 'G01', x: 50, z: 2, rpm: 1800, f: 0.2, active: 6 },
          { g: 'G01', x: 50, z: -45, rpm: 1800, f: 0.18, active: 7, cutting: true },
          { g: 'G01', x: 70, z: -45, rpm: 1800, f: 0.18, active: 8, cutting: true },
          { g: 'G01', x: 70, z: -90, rpm: 1800, f: 0.18, active: 9, cutting: true },
          { g: 'G01', x: 82, z: -90, rpm: 1800, f: 0.2, active: 10, cutting: true },
          { g: 'G00', x: 120, z: 50, rpm: 0, f: 0, active: 11 },
          { g: 'M30', x: 120, z: 50, rpm: 0, f: 0, active: 14 }
        ]
      },
      milling_contour: {
        type: 'milling',
        name: 'CNC VMC: Pocket Contour & Profile',
        stock: { width: 200, height: 140 },
        code: [
          'O2002 (3-AXIS VMC PROFILE MILLING)',
          'G21 G90 G54 (WORK OFFSET 1)',
          'G00 Z50.0 M03 S2400 (SPINDLE ON)',
          'G00 X30.0 Y30.0 M08 (RAPID TO ORIGIN)',
          'G01 Z-5.0 F150 (PLUNGE CUT)',
          'G01 X150.0 Y30.0 F300 (CUT SIDE 1)',
          'G02 X180.0 Y60.0 R30.0 (CORNER RADIUS)',
          'G01 X180.0 Y110.0 (CUT SIDE 2)',
          'G01 X30.0 Y110.0 (CUT TOP EDGE)',
          'G01 X30.0 Y30.0 (CLOSE PROFILE)',
          'G00 Z50.0 M09 (TOOL RETRACT)',
          'M30 (PROGRAM END)'
        ],
        steps: [
          { g: 'G00', x: 30, y: 30, z: 50, rpm: 2400, f: 0, active: 3 },
          { g: 'G01', x: 30, y: 30, z: -5, rpm: 2400, f: 150, active: 4, cutting: true },
          { g: 'G01', x: 150, y: 30, z: -5, rpm: 2400, f: 300, active: 5, cutting: true },
          { g: 'G02', x: 180, y: 60, z: -5, rpm: 2400, f: 250, active: 6, cutting: true },
          { g: 'G01', x: 180, y: 110, z: -5, rpm: 2400, f: 300, active: 7, cutting: true },
          { g: 'G01', x: 30, y: 110, z: -5, rpm: 2400, f: 300, active: 8, cutting: true },
          { g: 'G01', x: 30, y: 30, z: -5, rpm: 2400, f: 300, active: 9, cutting: true },
          { g: 'G00', x: 30, y: 30, z: 50, rpm: 0, f: 0, active: 10 },
          { g: 'M30', x: 30, y: 30, z: 50, rpm: 0, f: 0, active: 11 }
        ]
      }
    };

    this.activePresetKey = 'turning_step';
    this.currentProgram = this.programs[this.activePresetKey];

    this.initCanvasSize();
    this.renderCodeLines();
    this.resetSimulation();
    this.setupListeners();
    this.draw();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: 560, height: 260 };
    this.canvas.width = Math.floor(rect.width || (window.innerWidth < 480 ? 320 : 560));
    this.canvas.height = Math.floor(rect.height || (window.innerWidth < 480 ? 220 : 260));
  }

  setupListeners() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.draw();
    });

    const presetSelect = document.getElementById('simPresetSelect');
    if (presetSelect) {
      presetSelect.addEventListener('change', (e) => {
        this.loadPreset(e.target.value);
      });
    }

    const btnRun = document.getElementById('btnCncRun');
    if (btnRun) {
      btnRun.addEventListener('click', () => {
        if (!this.isRunning) {
          this.startSimulation();
          btnRun.innerHTML = '<span>⏸</span> Pause';
        } else if (this.isPaused) {
          this.isPaused = false;
          btnRun.innerHTML = '<span>⏸</span> Pause';
        } else {
          this.isPaused = true;
          btnRun.innerHTML = '<span>▶</span> Resume';
        }
      });
    }

    const btnReset = document.getElementById('btnCncReset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.resetSimulation();
        if (btnRun) btnRun.innerHTML = '<span>▶</span> Run Toolpath';
      });
    }
  }

  loadPreset(presetKey) {
    this.activePresetKey = presetKey;
    this.currentProgram = this.programs[presetKey];
    this.renderCodeLines();
    this.resetSimulation();
    const btnRun = document.getElementById('btnCncRun');
    if (btnRun) btnRun.innerHTML = '<span>▶</span> Run Toolpath';
  }

  renderCodeLines() {
    const editor = document.getElementById('cncCodeEditor');
    if (!editor) return;

    editor.innerHTML = this.currentProgram.code.map((line, idx) => `
      <div class="code-line" id="cnc-line-${idx}">
        <span class="line-no">${idx + 1}</span>
        <span class="line-content">${this.syntaxHighlight(line)}</span>
      </div>
    `).join('');
  }

  syntaxHighlight(line) {
    return line
      .replace(/\((.*?)\)/g, '<span style="color:#64748b;">($1)</span>')
      .replace(/(G\d+|M\d+)/g, '<span style="color:#00d2ff; font-weight:700;">$1</span>')
      .replace(/([XYZFSR]\d+(\.\d+)?)/g, '<span style="color:#fbbf24;">$1</span>')
      .replace(/(T\d+)/g, '<span style="color:#ff6b35;">$1</span>');
  }

  resetSimulation() {
    this.isRunning = false;
    this.isPaused = false;
    cancelAnimationFrame(this.animationId);
    this.currentStep = 0;
    this.progress = 0;
    this.cutPath = [];
    this.chips = [];

    const first = this.currentProgram.steps[0];
    this.pos = { x: first.x, y: first.y || 0, z: first.z || 0 };
    this.spindleRPM = 0;
    this.feedRate = 0;
    this.activeG = 'G00';

    this.updateHUD();
    this.highlightLine(0);
    this.draw();
  }

  startSimulation() {
    this.isRunning = true;
    this.isPaused = false;
    this.animate();
  }

  animate() {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      this.updateStep();
      this.draw();
    }

    if (this.currentStep < this.currentProgram.steps.length) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.isRunning = false;
      const btnRun = document.getElementById('btnCncRun');
      if (btnRun) btnRun.innerHTML = '<span>↺</span> Replay';
    }
  }

  updateStep() {
    const steps = this.currentProgram.steps;
    if (this.currentStep >= steps.length) return;

    const target = steps[this.currentStep];
    const prev = this.currentStep > 0 ? steps[this.currentStep - 1] : target;

    this.activeG = target.g;
    this.spindleRPM = target.rpm;
    this.feedRate = target.f;

    this.highlightLine(target.active);

    // Speed interpolation
    this.progress += 0.04 * this.speed;

    if (this.progress >= 1) {
      this.pos.x = target.x;
      this.pos.y = target.y !== undefined ? target.y : 0;
      this.pos.z = target.z !== undefined ? target.z : 0;

      this.cutPath.push({ ...this.pos, cutting: target.cutting });
      this.progress = 0;
      this.currentStep++;
    } else {
      // Interpolate
      const curX = prev.x + (target.x - prev.x) * this.progress;
      const curY = (prev.y || 0) + ((target.y || 0) - (prev.y || 0)) * this.progress;
      const curZ = (prev.z || 0) + ((target.z || 0) - (prev.z || 0)) * this.progress;

      this.pos.x = Math.round(curX * 10) / 10;
      this.pos.y = Math.round(curY * 10) / 10;
      this.pos.z = Math.round(curZ * 10) / 10;

      if (target.cutting) {
        this.cutPath.push({ ...this.pos, cutting: true });
        // Emit metal chips
        if (Math.random() > 0.4) {
          this.chips.push({
            x: this.pos.z, // mapped in draw
            y: this.pos.x,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 2,
            life: 1.0
          });
        }
      }
    }

    this.updateHUD();
  }

  highlightLine(lineIndex) {
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById(`cnc-line-${lineIndex}`);
    if (activeEl) {
      activeEl.classList.add('active');
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  updateHUD() {
    const elX = document.getElementById('hudX');
    const elZ = document.getElementById('hudZ');
    const elRPM = document.getElementById('hudRPM');
    const elFeed = document.getElementById('hudFeed');
    const elMode = document.getElementById('hudMode');

    if (elX) elX.textContent = `X ${this.pos.x.toFixed(1)}`;
    if (elZ) elZ.textContent = this.currentProgram.type === 'turning' ? `Z ${this.pos.z.toFixed(1)}` : `Y ${this.pos.y.toFixed(1)}`;
    if (elRPM) elRPM.textContent = `${this.spindleRPM} RPM`;
    if (elFeed) elFeed.textContent = `${this.feedRate} mm/m`;
    if (elMode) elMode.textContent = this.activeG;
  }

  draw() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Draw Grid (Engineering coordinate system)
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.currentProgram.type === 'turning') {
      this.drawTurningSimulation(w, h);
    } else {
      this.drawMillingSimulation(w, h);
    }
  }

  drawTurningSimulation(w, h) {
    const ctx = this.ctx;
    const isMobile = w < 480;
    const originX = isMobile ? Math.max(45, w * 0.18) : 120;
    const originY = h / 2;
    const scale = isMobile ? Math.min(1.2, Math.max(0.7, (w - originX - 30) / 160)) : 1.6;

    // 1. Chuck Clamps (Left side)
    const chuckW = isMobile ? Math.max(30, originX - 25) : 70;
    const jawX = isMobile ? Math.max(35, originX - 20) : 80;
    const jawW = isMobile ? 15 : 25;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(10, originY - (isMobile ? 55 : 70), chuckW, isMobile ? 110 : 140);
    ctx.strokeRect(10, originY - (isMobile ? 55 : 70), chuckW, isMobile ? 110 : 140);

    // Jaws
    ctx.fillStyle = '#334155';
    ctx.fillRect(jawX, originY - (isMobile ? 50 : 60), jawW, isMobile ? 22 : 30);
    ctx.fillRect(jawX, originY + (isMobile ? 28 : 30), jawW, isMobile ? 22 : 30);

    // Centerline (Lathe Axis)
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.beginPath();
    ctx.moveTo(10, originY);
    ctx.lineTo(w - 20, originY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Workpiece Billet (Steel stock)
    const stockLength = 220 * scale * 0.7;
    const stockRadius = 40 * scale;

    const grad = ctx.createLinearGradient(0, originY - stockRadius, 0, originY + stockRadius);
    grad.addColorStop(0, '#64748b');
    grad.addColorStop(0.3, '#cbd5e1');
    grad.addColorStop(0.5, '#f8fafc');
    grad.addColorStop(0.7, '#cbd5e1');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.fillRect(originX, originY - stockRadius, stockLength, stockRadius * 2);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(originX, originY - stockRadius, stockLength, stockRadius * 2);

    // 3. Render Toolpath Cuts
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#00d2ff';
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < this.cutPath.length; i++) {
      const p = this.cutPath[i];
      const px = originX + stockLength + (p.z * scale);
      const py = originY - (p.x / 2 * scale);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // 4. Cutting Tool (Carbide insert & Toolholder)
    const toolX = originX + stockLength + (this.pos.z * scale);
    const toolY = originY - (this.pos.x / 2 * scale);

    // Tool Shank
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toolX, toolY);
    ctx.lineTo(toolX + 30, toolY - 45);
    ctx.lineTo(toolX + 60, toolY - 45);
    ctx.lineTo(toolX + 45, toolY + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Carbide Insert Tip
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(toolX, toolY);
    ctx.lineTo(toolX + 12, toolY - 14);
    ctx.lineTo(toolX + 22, toolY - 5);
    ctx.closePath();
    ctx.fill();

    // Coolant spray effect if spindle active
    if (this.spindleRPM > 0 && this.feedRate > 0) {
      ctx.fillStyle = 'rgba(0, 210, 255, 0.6)';
      for (let c = 0; c < 5; c++) {
        ctx.beginPath();
        ctx.arc(toolX - Math.random() * 15, toolY + Math.random() * 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawMillingSimulation(w, h) {
    const ctx = this.ctx;
    const isMobile = w < 480;
    const originX = isMobile ? 20 : 80;
    const originY = isMobile ? 25 : 40;
    const scale = isMobile ? Math.min(1.4, Math.max(0.75, (w - 40) / 180)) : 2.0;

    // Milling Billet (Stock plate)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(originX, originY, 200 * scale * 0.8, 140 * scale * 0.65);
    ctx.strokeRect(originX, originY, 200 * scale * 0.8, 140 * scale * 0.65);

    // Toolpath
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < this.cutPath.length; i++) {
      const p = this.cutPath[i];
      const px = originX + (p.x * scale * 0.8);
      const py = originY + (p.y * scale * 0.65);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Endmill Cutter Representation
    const curX = originX + (this.pos.x * scale * 0.8);
    const curY = originY + (this.pos.y * scale * 0.65);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(curX, curY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.cncSimulator = new CNCSimulator();
});
