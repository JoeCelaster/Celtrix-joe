import { execSync } from "child_process";
import { logger } from "./logger.js";
import path from "path";
import fs from "fs";

export function installDependencies(projectPath, config, projectName) {
  logger.info("📦 Installing dependencies...");

  try {
    const clientDir = fs.existsSync(path.join(projectPath, "client"))
      ? path.join(projectPath, "client")
      : path.join(projectPath, "client");

    const serverDir = fs.existsSync(path.join(projectPath, "server"))
      ? path.join(projectPath, "server")
      : path.join(projectPath, "server");

    if (fs.existsSync(clientDir)) {
      execSync("npm install", { cwd: clientDir, stdio: "inherit", shell: true });
    }
    if (fs.existsSync(serverDir)) {
      execSync("npm install", { cwd: serverDir, stdio: "inherit", shell: true });
    }

    logger.info("✅ Dependencies installed successfully");
  } catch (err) {
    logger.error("❌ Failed to install dependencies");
    throw err;
  }
}


export function angularSetup(projectPath, config, projectName) {
  logger.info("⚡ Setting up Angular...");

  try {
    // Create Angular project (no Tailwind)
    execSync(`npx -y @angular/cli new client --style=css --skip-git --skip-install`, {
      cwd: projectPath,
      stdio: "inherit",
      shell: true, // fixes ENOENT
    });

    logger.info("✅ Angular project created successfully!");
  } catch (error) {
    logger.error("❌ Failed to set up Angular");
    throw error;
  }
}

export function angularTailwindSetup(projectPath, config, projectName) {
  logger.info("⚡ Setting up Angular + Tailwind...");

  try {
    // 1. Create Angular project (inside projectPath)
    execSync(`npx -y @angular/cli new client --style css`, {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });

    const clientPath = path.join(projectPath, "client");

    // 2. Install Tailwind + PostCSS
    execSync(`npm install tailwindcss @tailwindcss/postcss postcss --force`, {
      cwd: clientPath,
      stdio: "inherit",
      shell: true,
    });

    // 3. Create tailwind.config.js
    const tailwindConfigPath = path.join(clientPath, ".postcssrc.json");

    fs.writeFileSync(
      tailwindConfigPath,
      `{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}`
    );

    // 4. Update styles.css with Tailwind directives
    const stylesPath = path.join(clientPath, "src/styles.css");
    fs.writeFileSync(
      stylesPath,
      `@import "tailwindcss";\n`

    );

    logger.info("✅ Angular + Tailwind setup completed!");
  } catch (error) {
    logger.error("❌ Failed to set up Angular Tailwind");
    throw error;
  }
}

export function mernSetup(projectPath, config, projectName) {
  logger.info("⚡ Setting up MERN...");

  try {
    // 1. Create MERN project
    execSync(`npm create vite@latest client -- --template react`, {
      cwd: projectPath,
      stdio: "inherit",
      shell: true,
    });

    const appJsxPath = path.join(projectPath, "client", "src", "App.jsx");
    const appCssPath = path.join(projectPath,"client", "src", "index.css");

    let appJsx = fs.readFileSync(appJsxPath, "utf-8");
    const lines = appJsx.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("</>")) {
        // inject badge right after opening fragment
        lines.splice(i, 0, `  <div className="powered-badge">Powered by <span className="celtrix">Celtrix</span></div>`);
        break;
      }
    }

    fs.writeFileSync(appJsxPath, lines.join("\n"), "utf-8");

    // append CSS
    const badgeCSS = `
    .powered-badge {
      position: fixed;
      bottom: 1.5rem;
      left: 1.5rem;
      font-size: 0.875rem;
      background-color: black;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.75rem;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1),
                  0 4px 6px -2px rgba(0,0,0,0.05);
      opacity: 0.8;
      transition: opacity 0.2s ease-in-out;
    }

    .powered-badge:hover {
      opacity: 1;
    }

    .powered-badge .celtrix {
      font-weight: 600;
      color: #4ade80;
    }
    `;

    fs.appendFileSync(appCssPath, badgeCSS, "utf-8");

    logger.info("✅ MERN project created successfully!");
  } catch (error) {
    logger.error("❌ Failed to set up MERN");
    throw error;
  }
}
