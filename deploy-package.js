#!/usr/bin/env node
// ============================================================
// DEPLOY-PACKAGE.JS
// Create deployable package with all features
//
// PURPOSE:
//   - Bundle complete game with premium AI models
//   - Create downloadable distribution packages
//   - Configure for offline deployment
//   - Set up proper file structure
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 === TECHNOMANCER DEPLOYMENT PACKAGER === 🚀');
console.log('');

// Configuration
const config = {
  projectName: "TECHNOMANCER-Quest_For_The_Code",
  version: "1.0.0",
  deployDir: "./deploy",
  
  // Package configurations - Consumer consumption-only versions
  packages: {
    web: {
      name: "TECHNOMANCER-Web",
      description: "Browser version - No installation required",
      platform: "web",
      aiTier: "consumption_only",
      size: "~50MB",
      features: ["pre_made_characters", "mystical_ai_responses", "browser_play"]
    },
    desktop: {
      name: "TECHNOMANCER-Desktop",
      description: "Electron desktop app with packaged content",
      platform: "electron", 
      aiTier: "consumption_plus",
      size: "~200MB",
      features: ["offline_play", "pre_made_characters", "saved_progress", "mystical_ai"]
    },
    deluxe: {
      name: "TECHNOMANCER-Deluxe",
      description: "Premium desktop with extended content library",
      platform: "electron",
      aiTier: "consumption_deluxe", 
      size: "~500MB",
      features: ["extended_character_library", "premium_voices", "bonus_quests", "mystical_ai_enhanced"]
    }
  },

  // Electron configuration for desktop packages
  electronConfig: {
    appId: "com.technomancer.questforthecode",
    productName: "TECHNOMANCER: Quest for the Code",
    copyright: "Copyright © 2026 TECHNOMANCER Games",
    icon: "./ASSETS/icon",
    directories: {
      output: "./deploy/electron-dist"
    },
    files: [
      "game/**/*",
      "node_modules/**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,readme.md}"
    ],
    win: {
      target: "nsis",
      icon: "./ASSETS/icon.ico"
    },
    mac: {
      target: "dmg",
      icon: "./ASSETS/icon.icns"
    },
    linux: {
      target: "AppImage",
      icon: "./ASSETS/icon.png"
    }
  },

  // Files to include in deployment
  includeFiles: [
    // Core game files
    "index.html",
    "GameEngine.js",
    "GameUI.js", 
    "GraphicsUI.js",
    
    // Consumer AI systems - consumption only, no creation
    "ai-config-consumer.js",
    "ai-dm-integration.js", 
    "browser-llm.js",
    "neural-tts.js",
    "cast-console-ui.js",
    "pre-made-content.js",
    "mystical-responses.js",
    
    // Game systems
    "ancient-terminals.js",
    "terminals-data.js",
    "quest-system.js",
    "save-system.js",
    "battle-core.js",
    "spell-crafting.js",
    "dice.js",
    "fx.js",
    "fx-audio.js",
    
    // UI systems
    "ui-layout-manager.js",
    "pane-manager.js",
    "window-manager.js",
    "cast-console-ui.js",
    "character-status-panel.js",
    
    // Data and assets
    "terminals-data.js",
    "spells-data.js",
    "enemies-battle.js",
    "zones-puzzles.js",
    "ASSETS/**/*",
    
    // Configuration
    "package.json",
    "server.js"
  ],

  // Files to exclude
  excludeFiles: [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "deploy/**",
    "*.log",
    ".env*",
    "*.md",
    "public/**" // We'll use the root files
  ]
};

// ============================================================
// [PACKAGING FUNCTIONS]
// ============================================================

async function createDeploymentDirectory() {
  console.log('📁 Creating deployment directory...');
  
  if (fs.existsSync(config.deployDir)) {
    fs.rmSync(config.deployDir, { recursive: true, force: true });
  }
  
  fs.mkdirSync(config.deployDir, { recursive: true });
  console.log('✅ Deploy directory created');
}

async function copyGameFiles() {
  console.log('📦 Copying game files...');
  
  const sourceDir = './';
  const targetDir = path.join(config.deployDir, 'game');
  
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copy included files
  for (const filePattern of config.includeFiles) {
    if (filePattern.includes('*')) {
      // Handle wildcards (simplified)
      if (filePattern.startsWith('ASSETS/')) {
        copyDirectory('./ASSETS', path.join(targetDir, 'ASSETS'));
      }
    } else {
      // Copy individual files
      if (fs.existsSync(filePattern)) {
        const targetFile = path.join(targetDir, filePattern);
        const targetFileDir = path.dirname(targetFile);
        
        if (!fs.existsSync(targetFileDir)) {
          fs.mkdirSync(targetFileDir, { recursive: true });
        }
        
        fs.copyFileSync(filePattern, targetFile);
        console.log(`  ✅ ${filePattern}`);
      } else {
        console.log(`  ⚠️  Missing: ${filePattern}`);
      }
    }
  }
}

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  
  fs.mkdirSync(destination, { recursive: true });
  
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// ============================================================
// [CONSUMER PACKAGING FUNCTIONS]
// ============================================================

async function createConsumerPackages() {
  console.log('📱 Creating consumer packages...');
  
  for (const [packageId, packageConfig] of Object.entries(config.packages)) {
    await createSinglePackage(packageId, packageConfig);
  }
  
  console.log('✅ All consumer packages created');
}

async function createSinglePackage(packageId, packageConfig) {
  console.log(`🎮 Creating ${packageConfig.name}...`);
  
  const packageDir = path.join(config.deployDir, packageConfig.name);
  fs.mkdirSync(packageDir, { recursive: true });
  
  if (packageConfig.platform === 'electron') {
    await createElectronPackage(packageId, packageConfig, packageDir);
  } else {
    await createWebPackage(packageId, packageConfig, packageDir);
  }
  
  // Create consumer-specific configuration
  await createConsumerConfig(packageConfig, packageDir);
  
  console.log(`✅ ${packageConfig.name} package created`);
}

async function createWebPackage(packageId, packageConfig, packageDir) {
  // Copy game files to web package
  const gameDir = path.join(packageDir, 'game');
  fs.mkdirSync(gameDir, { recursive: true });
  
  // Copy consumer-safe files only
  const consumerFiles = [
    'index.html',
    'GameEngine.js',
    'GameUI.js',
    'GraphicsUI.js',
    'ai-config-consumer.js',
    'ai-dm-integration.js',
    'browser-llm.js',
    'neural-tts.js',
    'pre-made-content.js',
    'mystical-responses.js',
    'ancient-terminals.js',
    'quest-system.js',
    'save-system.js',
    'battle-core.js',
    'spell-crafting.js',
    'dice.js',
    'fx.js',
    'fx-audio.js'
  ];
  
  for (const file of consumerFiles) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(gameDir, file));
    }
  }
  
  // Copy assets
  if (fs.existsSync('./ASSETS')) {
    copyDirectory('./ASSETS', path.join(gameDir, 'ASSETS'));
  }
  
  // Create web-specific files
  await createWebSpecificFiles(packageDir, packageConfig);
}

async function createElectronPackage(packageId, packageConfig, packageDir) {
  // Copy all web files first
  await createWebPackage(packageId, packageConfig, packageDir);
  
  // Add Electron-specific files
  await createElectronFiles(packageDir, packageConfig);
  
  console.log(`  📱 Electron files created for ${packageConfig.name}`);
}

async function createElectronFiles(packageDir, packageConfig) {
  // Create main.js for Electron
  const mainJs = `
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'game/ASSETS/icon.png'),
    title: '${packageConfig.name}'
  });

  mainWindow.loadFile('game/index.html');
  
  // Hide menu bar for clean gaming experience
  Menu.setApplicationMenu(null);
  
  // Prevent external navigation
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`;
  
  fs.writeFileSync(path.join(packageDir, 'main.js'), mainJs);
  
  // Create package.json for Electron
  const electronPackageJson = {
    name: packageConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: "1.0.0",
    description: packageConfig.description,
    main: "main.js",
    scripts: {
      start: "electron .",
      build: "electron-builder"
    },
    author: "TECHNOMANCER Games",
    license: "Proprietary",
    devDependencies: {
      electron: "^27.0.0",
      "electron-builder": "^24.0.0"
    }
  };
  
  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify(electronPackageJson, null, 2)
  );
}

async function createWebSpecificFiles(packageDir, packageConfig) {
  // Create README for web version
  const readme = `# ${packageConfig.name}

${packageConfig.description}

## How to Play

1. Open index.html in your web browser
2. Enjoy the mystical adventure!

## Features

${packageConfig.features?.map(f => `- ${f.replace(/_/g, ' ')}`).join('\n') || '- Magical RPG experience'}

## Size

${packageConfig.size}

---

*Powered by TECHNOMANCER Engine*
`;
  
  fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);
  
  // Create simple launch script
  const launchScript = `@echo off
echo Starting TECHNOMANCER...
echo.
echo Opening game in your default browser...
start game/index.html
echo.
echo Game launched! Close this window if desired.
pause
`;
  
  fs.writeFileSync(path.join(packageDir, 'START_GAME.bat'), launchScript);
}

async function createConsumerConfig(packageConfig, packageDir) {
  // Create deployment info for this package
  const deploymentInfo = {
    packageName: packageConfig.name,
    description: packageConfig.description,
    platform: packageConfig.platform,
    aiTier: packageConfig.aiTier,
    size: packageConfig.size,
    features: packageConfig.features || [],
    restrictions: {
      characterCreation: false,
      voiceTraining: false, 
      contentGeneration: false,
      devModeAccess: false
    },
    consumptionOnly: true,
    version: "1.0.0",
    buildDate: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(packageDir, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
}
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

async function createPackageConfigurations() {
  console.log('⚙️ Creating package configurations...');
  
  for (const [tierName, tierConfig] of Object.entries(config.packages)) {
    const packageDir = path.join(config.deployDir, tierConfig.name);
    const gameDir = path.join(packageDir, 'game');
    
    // Copy game files to package directory
    copyDirectory(path.join(config.deployDir, 'game'), gameDir);
    
    // Create package-specific configuration
    const deploymentConfig = {
      tier: tierName,
      aiTier: tierConfig.aiTier,
      name: tierConfig.name,
      description: tierConfig.description,
      estimatedSize: tierConfig.size,
      version: config.version,
      createdAt: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(packageDir, 'deployment-info.json'),
      JSON.stringify(deploymentConfig, null, 2)
    );
    
    // Create startup script
    const startupScript = `@echo off
title ${tierConfig.name}
echo Starting ${tierConfig.name}...
echo.
cd /d "%~dp0game"
echo Starting local server...
node server.js
pause`;
    
    fs.writeFileSync(path.join(packageDir, 'START_GAME.bat'), startupScript);
    
    // Create README
    const readme = `# ${tierConfig.name}

${tierConfig.description}

## Quick Start

1. Double-click START_GAME.bat
2. Open your web browser to http://localhost:3000
3. Type 'help' to see all commands
4. Type '-get ${tierName}' to download AI models

## AI Features

- Crystal Ball Oracle consultation
- Terminal hacking minigames with specialized AI
- Dynamic narrative generation
- NPC dialogue system

## Commands

- \`help\` - Show all commands
- \`oracle <question>\` - Consult the Crystal Ball Oracle  
- \`terminal\` - Access ancient terminals
- \`-get ${tierName}\` - Download ${tierName} AI models

## Package Info

- Version: ${config.version}
- AI Tier: ${tierConfig.aiTier}
- Estimated Size: ${tierConfig.size}
- Offline Capable: Yes

Enjoy your quest for the code!
`;
    
    fs.writeFileSync(path.join(packageDir, 'README.txt'), readme);
    
    console.log(`  ✅ ${tierConfig.name} package created`);
  }
}

async function createWebDownloadPage() {
  console.log('🌐 Creating web download page...');
  
  const downloadPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TECHNOMANCER - Download</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Courier Prime', monospace;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            color: #00ff00;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 3rem;
            font-weight: 700;
            text-shadow: 0 0 20px #00ff00;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.8;
        }
        
        .packages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }
        
        .package {
            background: rgba(0, 255, 0, 0.1);
            border: 2px solid #00ff00;
            border-radius: 10px;
            padding: 25px;
            transition: all 0.3s ease;
        }
        
        .package:hover {
            background: rgba(0, 255, 0, 0.2);
            box-shadow: 0 10px 30px rgba(0, 255, 0, 0.3);
        }
        
        .package-name {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .package-description {
            margin-bottom: 15px;
            opacity: 0.8;
        }
        
        .package-size {
            font-weight: 700;
            color: #ffff00;
            margin-bottom: 20px;
        }
        
        .download-btn {
            background: #00ff00;
            color: #000;
            border: none;
            padding: 12px 25px;
            font-family: 'Courier Prime', monospace;
            font-weight: 700;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
        }
        
        .download-btn:hover {
            background: #ffff00;
            box-shadow: 0 5px 15px rgba(255, 255, 0, 0.5);
        }
        
        .features {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 30px;
            margin-top: 40px;
        }
        
        .features h3 {
            margin-bottom: 20px;
            color: #ffff00;
        }
        
        .feature-list {
            list-style: none;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        
        .feature-list li {
            padding: 10px;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 5px;
        }
        
        .feature-list li::before {
            content: "⚡ ";
            color: #ffff00;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">TECHNOMANCER</h1>
            <p class="subtitle">Quest for the Code - AI-Powered Retro RPG</p>
        </div>
        
        <div class="packages">
            <div class="package">
                <h3 class="package-name">🪶 Lightweight Edition</h3>
                <p class="package-description">Perfect for quick demos and low-bandwidth deployment. Single AI model handles all tasks efficiently.</p>
                <p class="package-size">📦 Size: ~1.5GB</p>
                <button class="download-btn" onclick="downloadPackage('lightweight')">
                    Download Lightweight
                </button>
            </div>
            
            <div class="package">
                <h3 class="package-name">⚖️ Standard Edition</h3>
                <p class="package-description">Balanced performance with specialized models. Great for most users seeking quality AI interactions.</p>
                <p class="package-size">📦 Size: ~3.2GB</p>
                <button class="download-btn" onclick="downloadPackage('standard')">
                    Download Standard
                </button>
            </div>
            
            <div class="package">
                <h3 class="package-name">🚀 Premium Edition</h3>
                <p class="package-description">Maximum AI quality with full specialized model suite. Best experience for dedicated players.</p>
                <p class="package-size">📦 Size: ~7.5GB</p>
                <button class="download-btn" onclick="downloadPackage('premium')">
                    Download Premium
                </button>
            </div>
        </div>
        
        <div class="features">
            <h3>🎯 Game Features</h3>
            <ul class="feature-list">
                <li>Crystal Ball Oracle with AI consultation</li>
                <li>Terminal hacking minigames</li>
                <li>Specialized AI task delegation</li>
                <li>Dynamic narrative generation</li>
                <li>NPC dialogue system</li>
                <li>Progressive subzone unlocking</li>
                <li>Offline gameplay capability</li>
                <li>Retro cyberpunk aesthetic</li>
                <li>Spell crafting system</li>
                <li>Battle mechanics with AI strategy</li>
            </ul>
        </div>
    </div>
    
    <script>
        function downloadPackage(tier) {
            alert('Preparing download for ' + tier + ' edition...\\n\\nThis would initiate the actual download in a real deployment.');
            // In real deployment, this would trigger actual file download
            // window.location.href = '/downloads/' + tier + '.zip';
        }
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(config.deployDir, 'download.html'), downloadPageHTML);
  console.log('✅ Download page created');
}

async function generateDeploymentReport() {
  console.log('📊 Generating deployment report...');
  
  const report = {
    projectName: config.projectName,
    version: config.version,
    createdAt: new Date().toISOString(),
    packages: {},
    features: [
      "Crystal Ball Oracle with AI consultation",
      "Terminal hacking minigames with specialized AI",
      "Dynamic narrative generation", 
      "Progressive subzone unlocking system",
      "Specialized multi-model AI architecture",
      "Offline deployment capability",
      "Task-specific AI delegation"
    ],
    totalFiles: 0,
    estimatedSizes: {}
  };
  
  // Calculate package info
  for (const [tierName, tierConfig] of Object.entries(config.packages)) {
    const packagePath = path.join(config.deployDir, tierConfig.name);
    
    if (fs.existsSync(packagePath)) {
      const files = getFileCount(packagePath);
      report.packages[tierName] = {
        ...tierConfig,
        fileCount: files,
        path: packagePath
      };
      report.totalFiles += files;
    }
  }
  
  fs.writeFileSync(
    path.join(config.deployDir, 'deployment-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Deployment report generated');
  return report;
}

function getFileCount(dirPath) {
  let count = 0;
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    if (fs.statSync(itemPath).isDirectory()) {
      count += getFileCount(itemPath);
    } else {
      count++;
    }
  }
  
  return count;
}

// ============================================================
// [MAIN DEPLOYMENT PROCESS]
// ============================================================

async function main() {
  try {
    console.log('🎯 Starting deployment packaging...');
    console.log('');
    
    // Step 1: Setup
    await createDeploymentDirectory();
    
    // Step 2: Copy files
    await copyGameFiles();
    
    // Step 3: Create packages
    await createPackageConfigurations();
    
    // Step 4: Create download page
    await createWebDownloadPage();
    
    // Step 5: Generate report
    const report = await generateDeploymentReport();
    
    // Summary
    console.log('');
    console.log('🎉 === DEPLOYMENT COMPLETE === 🎉');
    console.log('');
    console.log('📦 Packages created:');
    for (const [tierName, tierData] of Object.entries(report.packages)) {
      console.log(`   ${tierData.name} (${tierData.size})`);
      console.log(`   └─ ${tierData.fileCount} files`);
    }
    console.log('');
    console.log('🌐 Download page: ./deploy/download.html');
    console.log('📊 Report: ./deploy/deployment-report.json');
    console.log('');
    console.log('🚀 Ready for distribution!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, config };