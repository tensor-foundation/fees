# Fees Program

Fees PDA and collection program.

## Programs

This project contains the following programs:

- [Fees Program](./programs/fees-program/README.md) `TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A`

You will need a Rust version compatible with BPF to compile the program, currently we recommend using Rust 1.75.0.

## Clients

This project contains the following clients:

- [JavaScript](./clients/js/README.md)
- [Rust](./clients/rust/README.md)

## Status

The new Fees program is currently deployed to devnet, and will be deployed to mainnet on October 2nd.

| Devnet | Mainnet |
| ------ | ------- |
| v0.1.0 | v0.1.0  |

## Contributing

Check out the [Contributing Guide](./CONTRIBUTING.md) the learn more about how to contribute to this project.

## Build

### Prerequisites

You need the following tools installed to build the project:

- pnpm v9+
- rust v1.78.0
- node v18+
- solana v1.17.23
- anchor v0.29.0

### Steps

Install JavaScript dependencies:

```bash
pnpm install
```

Build the program and generate the clients:

```bash
pnpm programs:build
pnpm generate
```

Run JS and Rust tests:

```bash
pnpm clients:js:test
pnpm clients:rust:test
```
