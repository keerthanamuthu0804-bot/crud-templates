// build.js
import { build } from "vite";

const names = ["crud-side-panel", "crud-modal", "crud-inline", "crud-page"];

for (const name of names) {
  await build({
    configFile: false, 
    publicDir: false,
    build: {
      outDir: "dist-templates",
      emptyOutDir: name === names[0],
      lib: {
        entry: `src/${name}.js`,
        formats: ["es"],
        fileName: () => `${name}.js`,
      },
    },
  });
}
