const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "program", "idl");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..");

generateIdl({
  generator: "anchor",
  programName: "fees_program",
  programId: "TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "program")
});
