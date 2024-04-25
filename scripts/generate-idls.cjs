const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "program", "idl");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..");

generateIdl({
  generator: "anchor",
  programName: "fees_program_program",
  programId: "HNs9y7yocDV3FU3s5C21mz4MTkzcoScYqxNesjWzcHk2",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "program")
});
