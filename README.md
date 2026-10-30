# Nitesh Jituri - Professional Portfolio Website

> **Mechanical Engineering Diploma Student • Certified CNC Specialist (VTU-NASD Grade A+) • Traditional Folk Artist & Mysore Dasara Performer**

---

## 🌟 Overview

A modern, responsive, high-performance portfolio website for **Nitesh Jituri**, crafted using **semantic HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism & Micro-animations), and Vanilla JavaScript (ES6+)**.

### Key Highlights & Features:
1. **Interactive CNC G-Code Simulator Widget**: Live toolpath canvas visualizer showing turning & milling tool trajectories, spindle RPM, feed rate, and real-time digital readouts.
2. **Virtual Bamboo Flute (Bansuri) Synthesizer**: Pure Web Audio API synthesis allowing visitors to play traditional Indian notes (Sa, Re, Ga, Ma, Pa, Dha, Ni) and preset melodies (Raag Bhupali & Folk).
3. **Verified VTU-NASD Certificate Showcase**: Modal inspection for the authentic *Certificate of Skill Competency in CNC Programming and Operation – TURNING & MILLING* (Grade Secured "A+", 160 Hours / 30 Days).
4. **Cultural & Stage Achievements**: Highlighting performances at the world-famous **Mysore Dasara Jamboo Savari** and on the **Chief Minister's Stage**, along with mastery in **Yakshagana**, **Kamsale**, **Kolata**, and **Tamate**.
5. **Print-Ready Resume / CV Modal**: 1-click printable and PDF-exportable curriculum vitae formatted for industrial recruiters.
6. **Dark / Light Theme Toggle**: Persistent theme choice with smooth color transitions.
7. **Interactive Domain Filter**: Switch between Engineering & CNC, Cultural Arts, or All Domains.
8. **Contact & WhatsApp Integration**: Direct WhatsApp message generation and contact inquiry form.

---

## 🚀 How to Run Locally

You can run this portfolio locally on your computer using any lightweight static server:

### Option 1: Using Node.js (npx serve)
```bash
npx serve .
```
Then open `http://localhost:3000` in your browser.

### Option 2: Using Python 3 (Recommended)
```bash
python -m http.server 8080
```
Then navigate to **`http://localhost:8080`** in your browser. *(Note: Do not use `[::]:8080` in the browser as Chromium blocks the IPv6 unspecified address).*

### Option 3: Using VS Code Live Server
Right-click `index.html` in VS Code and select **"Open with Live Server"**.

---

## 🌐 Free 1-Click Hosting Guide

This website is 100% static and requires zero backend server configuration, making it completely **free to host forever** on any of the following platforms:

### Method 1: GitHub Pages (Recommended & Free Forever)
1. Initialize a Git repository and push this folder to your GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Nitesh Jituri portfolio"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. On GitHub, go to your repository's **Settings** > **Pages**.
3. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
4. Your website will be live at `https://<your-username>.github.io/<your-repo-name>/` in 1-2 minutes!

---

### Method 2: Netlify (Drag & Drop in 30 Seconds)
1. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `Nitesh_Portfolio` folder directly into the browser window.
3. Your website goes live immediately with a free `.netlify.app` URL and free SSL!

---

### Method 3: Vercel (Instant Deploy)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Run in the project folder:
   ```bash
   vercel
   ```
3. Follow the 3 prompts to deploy your site live in seconds!

---

## 📁 File Structure

```
Nitesh_Portfolio/
├── index.html                       # Core single-page website
├── README.md                        # Documentation & Hosting guide
├── vercel.json                      # Vercel deployment config
├── css/
│   ├── style.css                    # Main design tokens, glassmorphism, responsive grid
│   └── animations.css               # Keyframes, glow pulses, micro-interactions
├── js/
│   ├── main.js                      # Theme switcher, scrollspy, counters, dynamic cert modal
│   ├── cnc-simulator.js             # Interactive CNC toolpath canvas engine
│   └── flute-synth.js               # Web Audio API Bansuri synthesizer
└── assets/
    ├── certificates/
    │   ├── nitesh_cnc_certificate.jpg               # VTU-NASD CNC Certificate (Image)
    │   ├── vtu_nasd_cnc_certificate.pdf             # VTU-NASD CNC Certificate (PDF)
    │   ├── gttc_certificate.jpg                     # GTTC Advance Manufacturing (Image)
    │   ├── gttc_advanced_manufacturing_certificate.pdf # GTTC Advance Manufacturing (PDF)
    │   ├── github_copilot_prompt_engineering.jpg   # Microsoft Copilot Prompting (Image)
    │   ├── github_copilot_prompt_engineering.pdf   # Microsoft Copilot Prompting (PDF)
    │   ├── google_cloud_drive.jpg                  # Google Drive Cloud Productivity (Image)
    │   └── google_cloud_drive.pdf                  # Google Drive Cloud Productivity (PDF)
    └── images/
        ├── nitesh_profile.jpg            # Professional portrait
        ├── cnc_machining.jpg             # High-precision CNC milling center
        ├── cad_3d_printing.jpg           # 3D CAD design & 3D printing prototyping
        ├── industrial_pumps_motors.jpg   # Industrial pump & motor cutaway
        └── karnataka_cultural_arts.jpg  # Mysore Dasara & Folk arts showcase
```
