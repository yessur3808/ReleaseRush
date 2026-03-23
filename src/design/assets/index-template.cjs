const path = require("path");

function defaultIndexTemplate(filePaths) {
  const exportEntries = filePaths.map((filePath) => {
    const basename = path.basename(filePath, path.extname(filePath));
    const exportName = ["Svg", basename].join("");
    return `export { ${exportName} } from './${basename}'`;
  });
  return exportEntries.join("\n");
}

module.exports = defaultIndexTemplate;
