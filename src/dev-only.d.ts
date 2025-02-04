declare global {
  // `RequestInfo` is used by `@metamask/controller-utils`, which is a
  // development dependency. This usually comes from TypeScript's DOM module,
  // but we don't want to enable that since we don't want to accidentally use
  // browser-only APIs in this package.
  type RequestInfo = {
    // Don't define anything on purpose
  };
}

// Export something so TypeScript will think this is a module and allow the use
// of global augmentation
export {};
