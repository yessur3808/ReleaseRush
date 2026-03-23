const path = require("path");

module.exports = {
  icon: false,
  expandProps: "end",
  filenameCase: "pascal",
  typescript: true,
  index: false,
  ref: true,
  outDir: "src/design/assets/generated",
  svgoConfig: {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      {
        name: "prefixIds",
        params: {
          prefix: (_, info) =>
            path
              .basename(info.path, ".svg")
              .replace(/[-+. ]/g, "_")
              .replace(/^[0-9]/, "_\0"),
        },
      },
      {
        name: "add-data-icon-to-svg-icons",
        fn(root, _params, info) {
          const { basename } = info.path.match(/.*\/(?<basename>.*)\.svg$/).groups;

          if (root.children[0].name === "svg") {
            root.children[0].attributes["data-icon"] = basename;
          }
        },
      },
    ],
  },
};
