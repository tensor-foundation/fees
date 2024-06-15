#!/usr/bin/env zx
import "zx/globals";
import * as k from "kinobi";
import { rootNodeFromAnchor } from "@kinobi-so/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@kinobi-so/renderers-js";
import { renderVisitor as renderRustVisitor } from "@kinobi-so/renderers-rust";
import { getAllProgramIdls } from "./utils.mjs";

// Instanciate Kinobi.
const [idl, ...additionalIdls] = getAllProgramIdls().map((idl) =>
  rootNodeFromAnchor(require(idl))
);
const kinobi = k.createFromRoot(idl, additionalIdls);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    feeVault: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "fee_vault"),
        k.variablePdaSeedNode(
          "shard",
          k.fixedSizeTypeNode(k.bytesTypeNode(), 1),
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
const jsClient = path.join(__dirname, "..", "clients", "js");
kinobi.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json"))
  })
);

// Render Rust.
const rustClient = path.join(__dirname, "..", "clients", "rust");
kinobi.accept(
  renderRustVisitor(path.join(rustClient, "src", "generated"), {
    formatCode: true,
    crateFolder: rustClient,
  })
);