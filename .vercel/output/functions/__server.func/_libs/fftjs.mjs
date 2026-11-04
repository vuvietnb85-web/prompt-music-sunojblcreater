import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/fftjs/dist/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _toConsumableArray(arr) {
		if (Array.isArray(arr)) {
			for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
			return arr2;
		} else return Array.from(arr);
	}
	var memoizedReversal = {};
	var memoizedZeroBuffers = {};
	module.exports = {
		bitReverseArray: function bitReverseArray(N) {
			if (memoizedReversal[N] === void 0) {
				var maxBinaryLength = (N - 1).toString(2).length;
				var templateBinary = "0".repeat(maxBinaryLength);
				var reversed = {};
				for (var n = 0; n < N; n++) {
					var currBinary = n.toString(2);
					currBinary = templateBinary.substr(currBinary.length) + currBinary;
					currBinary = [].concat(_toConsumableArray(currBinary)).reverse().join("");
					reversed[n] = parseInt(currBinary, 2);
				}
				memoizedReversal[N] = reversed;
			}
			return memoizedReversal[N];
		},
		multiply: function multiply(a, b) {
			return {
				"real": a.real * b.real - a.imag * b.imag,
				"imag": a.real * b.imag + a.imag * b.real
			};
		},
		add: function add(a, b) {
			return {
				"real": a.real + b.real,
				"imag": a.imag + b.imag
			};
		},
		subtract: function subtract(a, b) {
			return {
				"real": a.real - b.real,
				"imag": a.imag - b.imag
			};
		},
		euler: function euler(kn, N) {
			var x = -2 * Math.PI * kn / N;
			return {
				"real": Math.cos(x),
				"imag": Math.sin(x)
			};
		},
		conj: function conj(a) {
			a.imag *= -1;
			return a;
		},
		constructComplexArray: function constructComplexArray(signal) {
			var complexSignal = {};
			complexSignal.real = signal.real === void 0 ? signal.slice() : signal.real.slice();
			var bufferSize = complexSignal.real.length;
			if (memoizedZeroBuffers[bufferSize] === void 0) memoizedZeroBuffers[bufferSize] = Array.apply(null, Array(bufferSize)).map(Number.prototype.valueOf, 0);
			complexSignal.imag = memoizedZeroBuffers[bufferSize].slice();
			return complexSignal;
		}
	};
}));
//#endregion
//#region node_modules/fftjs/dist/fft.js
var require_fft = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var utils = require_utils();
	var fft = function fft(signal) {
		var complexSignal = {};
		if (signal.real === void 0 || signal.imag === void 0) complexSignal = utils.constructComplexArray(signal);
		else {
			complexSignal.real = signal.real.slice();
			complexSignal.imag = signal.imag.slice();
		}
		var N = complexSignal.real.length;
		var logN = Math.log2(N);
		if (Math.round(logN) != logN) throw new Error("Input size must be a power of 2.");
		if (complexSignal.real.length != complexSignal.imag.length) throw new Error("Real and imaginary components must have the same length.");
		var bitReversedIndices = utils.bitReverseArray(N);
		var ordered = {
			"real": [],
			"imag": []
		};
		for (var i = 0; i < N; i++) {
			ordered.real[bitReversedIndices[i]] = complexSignal.real[i];
			ordered.imag[bitReversedIndices[i]] = complexSignal.imag[i];
		}
		for (var _i = 0; _i < N; _i++) {
			complexSignal.real[_i] = ordered.real[_i];
			complexSignal.imag[_i] = ordered.imag[_i];
		}
		for (var n = 1; n <= logN; n++) {
			var currN = Math.pow(2, n);
			for (var k = 0; k < currN / 2; k++) {
				var twiddle = utils.euler(k, currN);
				for (var m = 0; m < N / currN; m++) {
					var currEvenIndex = currN * m + k;
					var currOddIndex = currN * m + k + currN / 2;
					var currEvenIndexSample = {
						"real": complexSignal.real[currEvenIndex],
						"imag": complexSignal.imag[currEvenIndex]
					};
					var currOddIndexSample = {
						"real": complexSignal.real[currOddIndex],
						"imag": complexSignal.imag[currOddIndex]
					};
					var odd = utils.multiply(twiddle, currOddIndexSample);
					var subtractionResult = utils.subtract(currEvenIndexSample, odd);
					complexSignal.real[currOddIndex] = subtractionResult.real;
					complexSignal.imag[currOddIndex] = subtractionResult.imag;
					var additionResult = utils.add(odd, currEvenIndexSample);
					complexSignal.real[currEvenIndex] = additionResult.real;
					complexSignal.imag[currEvenIndex] = additionResult.imag;
				}
			}
		}
		return complexSignal;
	};
	module.exports = {
		fft,
		ifft: function ifft(signal) {
			if (signal.real === void 0 || signal.imag === void 0) throw new Error("IFFT only accepts a complex input.");
			var N = signal.real.length;
			var complexSignal = {
				"real": [],
				"imag": []
			};
			for (var i = 0; i < N; i++) {
				var currentSample = {
					"real": signal.real[i],
					"imag": signal.imag[i]
				};
				var conjugateSample = utils.conj(currentSample);
				complexSignal.real[i] = conjugateSample.real;
				complexSignal.imag[i] = conjugateSample.imag;
			}
			var X = fft(complexSignal);
			complexSignal.real = X.real.map(function(val) {
				return val / N;
			});
			complexSignal.imag = X.imag.map(function(val) {
				return val / N;
			});
			return complexSignal;
		}
	};
}));
//#endregion
export { require_fft as t };
