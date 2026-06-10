import { build } from "esbuild";

// Compila o processo main e o preload do Electron para CJS.
// Saída .cjs é obrigatória: o package.json raiz usa "type": "module"
// e preload sandboxed precisa ser um único arquivo CommonJS.
const common = {
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  external: ["electron"],
  sourcemap: false,
};

await build({
  ...common,
  entryPoints: ["electron/main.ts"],
  outfile: "dist-electron/main.cjs",
});

await build({
  ...common,
  entryPoints: ["electron/preload.ts"],
  outfile: "dist-electron/preload.cjs",
});

console.log("[electron] main.cjs e preload.cjs gerados em dist-electron/");
