module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "refactor", "revert", "unit", "test", "wip"],
    ],
    "header-max-length": [2, "always", 72],
  },
  parserPreset: {
    parserOpts: {
      headerPattern:
        /^([A-Z]+-\d+):(chore|docs|feat|fix|refactor|revert|unit|test|wip):(.{1,1000})$/,
      headerCorrespondence: ["issue", "type", "subject"],
    },
  },
};
