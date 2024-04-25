const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "program", "idl");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "fees_program.json")]);

// Update programs.
kinobi.update(
  new k.updateProgramsVisitor({
    feesProgram: { name: "feesProgram" }
  })
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    feeVault: {
      seeds: [
        k.constantPdaSeedNodeFromString("fee_vault"),
        k.variablePdaSeedNode(
          "shard",
          k.bytesTypeNode(k.fixedSizeNode(1)),
          "The shard number, 0-255"
        )
      ]
    }
  })
);

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    collect: {
      remainingAccounts: [
        k.instructionRemainingAccountsNode(k.argumentValueNode("vaults"), {
          isOptional: false,
          isSigner: false,
          isWritable: true
        })
      ]
    }
  })
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(k.renderJavaScriptExperimentalVisitor(jsDir, { prettier }));

// Render Rust.
const crateDir = path.join(clientDir, "rust");
const rustDir = path.join(clientDir, "rust", "src", "generated");
kinobi.accept(
  k.renderRustVisitor(rustDir, {
    formatCode: true,
    crateFolder: crateDir
  })
);
