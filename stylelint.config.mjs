export default {
  extends: ["stylelint-config-standard"],

  ignoreFiles: [
    "_site/**",
    "node_modules/**",
    "vendor/**",
    ".jekyll-cache/**",
    "assets/css/vendor/**/*.css",
  ],

  rules: {
    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "custom-property-pattern": null,

    "declaration-empty-line-before": null,
    "custom-property-empty-line-before": null,

    "color-function-notation": null,
    "color-function-alias-notation": null,
    "alpha-value-notation": null,

    "font-family-name-quotes": null,
    "function-url-quotes": null,

    "color-hex-length": null,
    "length-zero-no-unit": null,

    "declaration-block-no-redundant-longhand-properties": null,

    "value-no-vendor-prefix": null,
    "property-no-vendor-prefix": null,

    "media-feature-range-notation": null,
    "no-descending-specificity": null,
  },
};
