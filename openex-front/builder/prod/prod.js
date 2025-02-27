const esbuild = require("esbuild");
const fsExtra = require("fs-extra");
const fs = require("fs");

const buildPath = "build";
esbuild
  .build({
    logLevel: "info",
    entryPoints: ["src/index.js"],
    bundle: true,
    loader: {
      ".js": "jsx",
      ".svg": "file",
      ".png": "file",
      ".woff": "dataurl",
      ".woff2": "dataurl",
      ".ttf": "dataurl",
      ".eot": "dataurl",
    },
    assetNames: "static/media/[name]-[hash]",
    entryNames: "static/[ext]/openex-[hash]",
    target: ["chrome58"],
    minify: true,
    keepNames: false,
    sourcemap: false,
    sourceRoot: "src",
    sourcesContent: false,
    outdir: buildPath,
    incremental: false,
  })
  .then(() => {
    // region Copy public files to build
    fsExtra.copySync("./builder/public/", buildPath, {
      recursive: true,
      overwrite: true,
    });
    // endregion
    // region Generate index.html
    const cssStaticFiles = fs.readdirSync(buildPath + "/static/css");
    const cssLinks = cssStaticFiles.map(
      (f) => `<link href="/static/css/${f}" rel="stylesheet">`
    );
    const cssImport = cssLinks.join("\n");
    const jsStaticFiles = fs.readdirSync(buildPath + "/static/js");
    const jsLinks = jsStaticFiles.map(
      (f) => `<script defer="defer" src="/static/js/${f}"></script>`
    );
    const jsImport = jsLinks.join("\n");
    const indexHtml = `
    <!doctype html>
    <html lang="en">
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <link rel="shortcut icon" href="/static/favicon.png">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>OpenEx - Crisis Drills Planning Platform</title>
        ${jsImport}
        ${cssImport}
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
        </body>
    </html>`;
    fs.writeFileSync(buildPath + "/index.html", indexHtml);
    // endregion
  });
