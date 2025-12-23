

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.BzCw8O8M.js","_app/immutable/chunks/C4KTUKtR.js","_app/immutable/chunks/hSOCBuBK.js"];
export const stylesheets = ["_app/immutable/assets/0.BMrV5yC_.css"];
export const fonts = [];
