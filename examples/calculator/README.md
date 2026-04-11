# CApp Calculator Example

This directory contains a simple Calculator application written in C, designed to be compiled to WebAssembly (WASM) and run in the PunkOS CApp Container.

## Prerequisites

To compile this example, you need a C compiler that supports WASM, such as `clang` or `emcc` (Emscripten).

## Compilation

### Using Clang (Recommended)

```bash
clang --target=wasm32 -O3 -nostdlib -Wl,--no-entry -Wl,--export-all -o calculator.wasm calculator.c
```

### Using Emscripten

```bash
emcc calculator.c -Os -s WASM=1 -s SIDE_MODULE=1 -o calculator.wasm
```

## Running in CApp

1. Open the DApp Market in PunkOS.
2. Select the Calculator CApp (or install it via the "Install to Local" button in CApp Details).
   - _Note: In the current testing environment, the installation might mock the download. You can replace the downloaded file path in the database or use the mock flow._
3. Open the "Calculator" icon on the desktop.
