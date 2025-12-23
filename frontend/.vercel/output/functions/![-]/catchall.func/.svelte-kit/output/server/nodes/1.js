

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.CfLMteP2.js","_app/immutable/chunks/C4KTUKtR.js","_app/immutable/chunks/hSOCBuBK.js","_app/immutable/chunks/C5fSrNf6.js"];
export const stylesheets = [];
export const fonts = [];
