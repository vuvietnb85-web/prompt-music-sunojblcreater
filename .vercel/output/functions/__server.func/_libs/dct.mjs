import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/dct/src/dct.js
var require_dct$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var cosMap = null;
	var memoizeCosines = function(N) {
		cosMap = cosMap || {};
		cosMap[N] = new Array(N * N);
		var PI_N = Math.PI / N;
		for (var k = 0; k < N; k++) for (var n = 0; n < N; n++) cosMap[N][n + k * N] = Math.cos(PI_N * (n + .5) * k);
	};
	function dct(signal, scale) {
		var L = signal.length;
		scale = scale || 2;
		if (!cosMap || !cosMap[L]) memoizeCosines(L);
		return signal.map(function() {
			return 0;
		}).map(function(__, ix) {
			return scale * signal.reduce(function(prev, cur, ix_, arr) {
				return prev + cur * cosMap[L][ix_ + ix * L];
			}, 0);
		});
	}
	module.exports = dct;
}));
//#endregion
//#region node_modules/dct/index.js
var require_dct = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_dct$1();
}));
//#endregion
export { require_dct as t };
