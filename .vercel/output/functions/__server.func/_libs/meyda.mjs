import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { t as require_dct } from "./dct.mjs";
import { t as require_fft } from "./fftjs.mjs";
import { __spreadArray } from "tslib";
//#region node_modules/meyda/dist/esm/windowing.js
var windowing_exports = /* @__PURE__ */ __exportAll({
	blackman: () => blackman,
	hamming: () => hamming,
	hanning: () => hanning,
	sine: () => sine
});
function blackman(size) {
	var blackmanBuffer = new Float32Array(size);
	var coeff1 = 2 * Math.PI / (size - 1);
	var coeff2 = 2 * coeff1;
	for (var i = 0; i < size / 2; i++) blackmanBuffer[i] = .42 - .5 * Math.cos(i * coeff1) + .08 * Math.cos(i * coeff2);
	for (var i = Math.ceil(size / 2); i > 0; i--) blackmanBuffer[size - i] = blackmanBuffer[i - 1];
	return blackmanBuffer;
}
function sine(size) {
	var coeff = Math.PI / (size - 1);
	var sineBuffer = new Float32Array(size);
	for (var i = 0; i < size; i++) sineBuffer[i] = Math.sin(coeff * i);
	return sineBuffer;
}
function hanning(size) {
	var hanningBuffer = new Float32Array(size);
	for (var i = 0; i < size; i++) hanningBuffer[i] = .5 - .5 * Math.cos(2 * Math.PI * i / (size - 1));
	return hanningBuffer;
}
function hamming(size) {
	var hammingBuffer = new Float32Array(size);
	for (var i = 0; i < size; i++) hammingBuffer[i] = .54 - .46 * Math.cos(2 * Math.PI * (i / size - 1));
	return hammingBuffer;
}
//#endregion
//#region node_modules/meyda/dist/esm/utilities.js
var windows = {};
function isPowerOfTwo(num) {
	while (num % 2 === 0 && num > 1) num /= 2;
	return num === 1;
}
function pointwiseBufferMult(a, b) {
	var c = [];
	for (var i = 0; i < Math.min(a.length, b.length); i++) c[i] = a[i] * b[i];
	return c;
}
function applyWindow(signal, windowname) {
	if (windowname !== "rect") {
		if (windowname === "" || !windowname) windowname = "hanning";
		if (!windows[windowname]) windows[windowname] = {};
		if (!windows[windowname][signal.length]) try {
			windows[windowname][signal.length] = windowing_exports[windowname](signal.length);
		} catch (e) {
			throw new Error("Invalid windowing function");
		}
		signal = pointwiseBufferMult(signal, windows[windowname][signal.length]);
	}
	return signal;
}
function createBarkScale(length, sampleRate, bufferSize) {
	var barkScale = new Float32Array(length);
	for (var i = 0; i < barkScale.length; i++) {
		barkScale[i] = i * sampleRate / bufferSize;
		barkScale[i] = 13 * Math.atan(barkScale[i] / 1315.8) + 3.5 * Math.atan(Math.pow(barkScale[i] / 7518, 2));
	}
	return barkScale;
}
function arrayToTyped(t) {
	return Float32Array.from(t);
}
function _melToFreq(melValue) {
	return 700 * (Math.exp(melValue / 1125) - 1);
}
function _freqToMel(freqValue) {
	return 1125 * Math.log(1 + freqValue / 700);
}
function createMelFilterBank(numFilters, sampleRate, bufferSize) {
	var melValues = new Float32Array(numFilters + 2);
	var melValuesInFreq = new Float32Array(numFilters + 2);
	var lowerLimitFreq = 0;
	var upperLimitFreq = sampleRate / 2;
	var lowerLimitMel = _freqToMel(lowerLimitFreq);
	var valueToAdd = (_freqToMel(upperLimitFreq) - lowerLimitMel) / (numFilters + 1);
	var fftBinsOfFreq = new Array(numFilters + 2);
	for (var i = 0; i < melValues.length; i++) {
		melValues[i] = i * valueToAdd;
		melValuesInFreq[i] = _melToFreq(melValues[i]);
		fftBinsOfFreq[i] = Math.floor((bufferSize + 1) * melValuesInFreq[i] / sampleRate);
	}
	var filterBank = new Array(numFilters);
	for (var j = 0; j < filterBank.length; j++) {
		filterBank[j] = new Array(bufferSize / 2 + 1).fill(0);
		for (var i = fftBinsOfFreq[j]; i < fftBinsOfFreq[j + 1]; i++) filterBank[j][i] = (i - fftBinsOfFreq[j]) / (fftBinsOfFreq[j + 1] - fftBinsOfFreq[j]);
		for (var i = fftBinsOfFreq[j + 1]; i < fftBinsOfFreq[j + 2]; i++) filterBank[j][i] = (fftBinsOfFreq[j + 2] - i) / (fftBinsOfFreq[j + 2] - fftBinsOfFreq[j + 1]);
	}
	return filterBank;
}
function hzToOctaves(freq, A440) {
	return Math.log2(16 * freq / A440);
}
function normalizeByColumn(a) {
	var emptyRow = a[0].map(function() {
		return 0;
	});
	var colDenominators = a.reduce(function(acc, row) {
		row.forEach(function(cell, j) {
			acc[j] += Math.pow(cell, 2);
		});
		return acc;
	}, emptyRow).map(Math.sqrt);
	return a.map(function(row, i) {
		return row.map(function(v, j) {
			return v / (colDenominators[j] || 1);
		});
	});
}
function createChromaFilterBank(numFilters, sampleRate, bufferSize, centerOctave, octaveWidth, baseC, A440) {
	if (centerOctave === void 0) centerOctave = 5;
	if (octaveWidth === void 0) octaveWidth = 2;
	if (baseC === void 0) baseC = true;
	if (A440 === void 0) A440 = 440;
	var numOutputBins = Math.floor(bufferSize / 2) + 1;
	var frequencyBins = new Array(bufferSize).fill(0).map(function(_, i) {
		return numFilters * hzToOctaves(sampleRate * i / bufferSize, A440);
	});
	frequencyBins[0] = frequencyBins[1] - 1.5 * numFilters;
	var binWidthBins = frequencyBins.slice(1).map(function(v, i) {
		return Math.max(v - frequencyBins[i]);
	}, 1).concat([1]);
	var halfNumFilters = Math.round(numFilters / 2);
	var filterPeaks = new Array(numFilters).fill(0).map(function(_, i) {
		return frequencyBins.map(function(frq) {
			return (10 * numFilters + halfNumFilters + frq - i) % numFilters - halfNumFilters;
		});
	});
	var weights = filterPeaks.map(function(row, i) {
		return row.map(function(_, j) {
			return Math.exp(-.5 * Math.pow(2 * filterPeaks[i][j] / binWidthBins[j], 2));
		});
	});
	weights = normalizeByColumn(weights);
	if (octaveWidth) {
		var octaveWeights = frequencyBins.map(function(v) {
			return Math.exp(-.5 * Math.pow((v / numFilters - centerOctave) / octaveWidth, 2));
		});
		weights = weights.map(function(row) {
			return row.map(function(cell, j) {
				return cell * octaveWeights[j];
			});
		});
	}
	if (baseC) weights = __spreadArray(__spreadArray([], weights.slice(3), true), weights.slice(0, 3), true);
	return weights.map(function(row) {
		return row.slice(0, numOutputBins);
	});
}
function frame(buffer, frameLength, hopLength) {
	if (buffer.length < frameLength) throw new Error("Buffer is too short for frame length");
	if (hopLength < 1) throw new Error("Hop length cannot be less that 1");
	if (frameLength < 1) throw new Error("Frame length cannot be less that 1");
	var numFrames = 1 + Math.floor((buffer.length - frameLength) / hopLength);
	return new Array(numFrames).fill(0).map(function(_, i) {
		return buffer.slice(i * hopLength, i * hopLength + frameLength);
	});
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/rms.js
function rms_default(_a) {
	var signal = _a.signal;
	if (typeof signal !== "object") throw new TypeError();
	var rms = 0;
	for (var i = 0; i < signal.length; i++) rms += Math.pow(signal[i], 2);
	rms = rms / signal.length;
	rms = Math.sqrt(rms);
	return rms;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/energy.js
function energy_default(_a) {
	var signal = _a.signal;
	if (typeof signal !== "object") throw new TypeError();
	var energy = 0;
	for (var i = 0; i < signal.length; i++) energy += Math.pow(Math.abs(signal[i]), 2);
	return energy;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralSlope.js
function spectralSlope_default(_a) {
	var ampSpectrum = _a.ampSpectrum, sampleRate = _a.sampleRate, bufferSize = _a.bufferSize;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var ampSum = 0;
	var freqSum = 0;
	var freqs = new Float32Array(ampSpectrum.length);
	var powFreqSum = 0;
	var ampFreqSum = 0;
	for (var i = 0; i < ampSpectrum.length; i++) {
		ampSum += ampSpectrum[i];
		var curFreq = i * sampleRate / bufferSize;
		freqs[i] = curFreq;
		powFreqSum += curFreq * curFreq;
		freqSum += curFreq;
		ampFreqSum += curFreq * ampSpectrum[i];
	}
	return (ampSpectrum.length * ampFreqSum - freqSum * ampSum) / (ampSum * (powFreqSum - Math.pow(freqSum, 2)));
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/extractorUtilities.js
function mu(i, amplitudeSpect) {
	var numerator = 0;
	var denominator = 0;
	for (var k = 0; k < amplitudeSpect.length; k++) {
		numerator += Math.pow(k, i) * Math.abs(amplitudeSpect[k]);
		denominator += amplitudeSpect[k];
	}
	return numerator / denominator;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralCentroid.js
function spectralCentroid_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	return mu(1, ampSpectrum);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralRolloff.js
function spectralRolloff_default(_a) {
	var ampSpectrum = _a.ampSpectrum, sampleRate = _a.sampleRate;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var ampspec = ampSpectrum;
	var nyqBin = sampleRate / (2 * (ampspec.length - 1));
	var ec = 0;
	for (var i = 0; i < ampspec.length; i++) ec += ampspec[i];
	var threshold = .99 * ec;
	var n = ampspec.length - 1;
	while (ec > threshold && n >= 0) {
		ec -= ampspec[n];
		--n;
	}
	return (n + 1) * nyqBin;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralFlatness.js
function spectralFlatness_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var numerator = 0;
	var denominator = 0;
	for (var i = 0; i < ampSpectrum.length; i++) {
		numerator += Math.log(ampSpectrum[i]);
		denominator += ampSpectrum[i];
	}
	return Math.exp(numerator / ampSpectrum.length) * ampSpectrum.length / denominator;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralSpread.js
function spectralSpread_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	return Math.sqrt(mu(2, ampSpectrum) - Math.pow(mu(1, ampSpectrum), 2));
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralSkewness.js
function spectralSkewness_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var mu1 = mu(1, ampSpectrum);
	var mu2 = mu(2, ampSpectrum);
	var mu3 = mu(3, ampSpectrum);
	return (2 * Math.pow(mu1, 3) - 3 * mu1 * mu2 + mu3) / Math.pow(Math.sqrt(mu2 - Math.pow(mu1, 2)), 3);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralKurtosis.js
function spectralKurtosis_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var ampspec = ampSpectrum;
	var mu1 = mu(1, ampspec);
	var mu2 = mu(2, ampspec);
	var mu3 = mu(3, ampspec);
	var mu4 = mu(4, ampspec);
	return (-3 * Math.pow(mu1, 4) + 6 * mu1 * mu2 - 4 * mu1 * mu3 + mu4) / Math.pow(Math.sqrt(mu2 - Math.pow(mu1, 2)), 4);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/zcr.js
function zcr_default(_a) {
	var signal = _a.signal;
	if (typeof signal !== "object") throw new TypeError();
	var zcr = 0;
	for (var i = 1; i < signal.length; i++) if (signal[i - 1] >= 0 && signal[i] < 0 || signal[i - 1] < 0 && signal[i] >= 0) zcr++;
	return zcr;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/loudness.js
function loudness_default(_a) {
	var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale, _b = _a.numberOfBarkBands, numberOfBarkBands = _b === void 0 ? 24 : _b;
	if (typeof ampSpectrum !== "object" || typeof barkScale !== "object") throw new TypeError();
	var NUM_BARK_BANDS = numberOfBarkBands;
	var specific = new Float32Array(NUM_BARK_BANDS);
	var total = 0;
	var normalisedSpectrum = ampSpectrum;
	var bbLimits = new Int32Array(NUM_BARK_BANDS + 1);
	bbLimits[0] = 0;
	var currentBandEnd = barkScale[normalisedSpectrum.length - 1] / NUM_BARK_BANDS;
	var currentBand = 1;
	for (var i = 0; i < normalisedSpectrum.length; i++) while (barkScale[i] > currentBandEnd) {
		bbLimits[currentBand++] = i;
		currentBandEnd = currentBand * barkScale[normalisedSpectrum.length - 1] / NUM_BARK_BANDS;
	}
	bbLimits[NUM_BARK_BANDS] = normalisedSpectrum.length - 1;
	for (var i = 0; i < NUM_BARK_BANDS; i++) {
		var sum = 0;
		for (var j = bbLimits[i]; j < bbLimits[i + 1]; j++) sum += normalisedSpectrum[j];
		specific[i] = Math.pow(sum, .23);
	}
	for (var i = 0; i < specific.length; i++) total += specific[i];
	return {
		specific,
		total
	};
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/perceptualSpread.js
function perceptualSpread_default(_a) {
	var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale;
	var loudnessValue = loudness_default({
		ampSpectrum,
		barkScale
	});
	var max = 0;
	for (var i = 0; i < loudnessValue.specific.length; i++) if (loudnessValue.specific[i] > max) max = loudnessValue.specific[i];
	return Math.pow((loudnessValue.total - max) / loudnessValue.total, 2);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/perceptualSharpness.js
function perceptualSharpness_default(_a) {
	var ampSpectrum = _a.ampSpectrum, barkScale = _a.barkScale;
	var loudnessValue = loudness_default({
		ampSpectrum,
		barkScale
	});
	var spec = loudnessValue.specific;
	var output = 0;
	for (var i = 0; i < spec.length; i++) if (i < 15) output += (i + 1) * spec[i + 1];
	else output += .066 * Math.exp(.171 * (i + 1));
	output *= .11 / loudnessValue.total;
	return output;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/powerSpectrum.js
function powerSpectrum_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var powerSpectrum = new Float32Array(ampSpectrum.length);
	for (var i = 0; i < powerSpectrum.length; i++) powerSpectrum[i] = Math.pow(ampSpectrum[i], 2);
	return powerSpectrum;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/melBands.js
function melBands_default(_a) {
	var ampSpectrum = _a.ampSpectrum, melFilterBank = _a.melFilterBank, bufferSize = _a.bufferSize;
	if (typeof ampSpectrum !== "object") throw new TypeError("Valid ampSpectrum is required to generate melBands");
	if (typeof melFilterBank !== "object") throw new TypeError("Valid melFilterBank is required to generate melBands");
	var powSpec = powerSpectrum_default({ ampSpectrum });
	var numFilters = melFilterBank.length;
	var filtered = Array(numFilters);
	var loggedMelBands = new Float32Array(numFilters);
	for (var i = 0; i < loggedMelBands.length; i++) {
		filtered[i] = new Float32Array(bufferSize / 2);
		loggedMelBands[i] = 0;
		for (var j = 0; j < bufferSize / 2; j++) {
			filtered[i][j] = melFilterBank[i][j] * powSpec[j];
			loggedMelBands[i] += filtered[i][j];
		}
		loggedMelBands[i] = Math.log(loggedMelBands[i] + 1);
	}
	return Array.prototype.slice.call(loggedMelBands);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/mfcc.js
var import_dct = /* @__PURE__ */ __toESM(require_dct());
function mfcc_default(_a) {
	var ampSpectrum = _a.ampSpectrum, melFilterBank = _a.melFilterBank, numberOfMFCCCoefficients = _a.numberOfMFCCCoefficients, bufferSize = _a.bufferSize;
	var _numberOfMFCCCoefficients = Math.min(40, Math.max(1, numberOfMFCCCoefficients || 13));
	if (melFilterBank.length < _numberOfMFCCCoefficients) throw new Error("Insufficient filter bank for requested number of coefficients");
	var loggedMelBandsArray = melBands_default({
		ampSpectrum,
		melFilterBank,
		bufferSize
	});
	return (0, import_dct.default)(loggedMelBandsArray).slice(0, _numberOfMFCCCoefficients);
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/chroma.js
function chroma_default(_a) {
	var ampSpectrum = _a.ampSpectrum, chromaFilterBank = _a.chromaFilterBank;
	if (typeof ampSpectrum !== "object") throw new TypeError("Valid ampSpectrum is required to generate chroma");
	if (typeof chromaFilterBank !== "object") throw new TypeError("Valid chromaFilterBank is required to generate chroma");
	var chromagram = chromaFilterBank.map(function(row, i) {
		return ampSpectrum.reduce(function(acc, v, j) {
			return acc + v * row[j];
		}, 0);
	});
	var maxVal = Math.max.apply(Math, chromagram);
	return maxVal ? chromagram.map(function(v) {
		return v / maxVal;
	}) : chromagram;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralFlux.js
function spectralFlux_default(_a) {
	var signal = _a.signal, previousSignal = _a.previousSignal, bufferSize = _a.bufferSize;
	if (typeof signal !== "object" || typeof previousSignal != "object") throw new TypeError();
	var sf = 0;
	for (var i = -(bufferSize / 2); i < signal.length / 2 - 1; i++) {
		x = Math.abs(signal[i]) - Math.abs(previousSignal[i]);
		sf += (x + Math.abs(x)) / 2;
	}
	return sf;
}
//#endregion
//#region node_modules/meyda/dist/esm/extractors/spectralCrest.js
function spectralCrest_default(_a) {
	var ampSpectrum = _a.ampSpectrum;
	if (typeof ampSpectrum !== "object") throw new TypeError();
	var rms = 0;
	var peak = -Infinity;
	ampSpectrum.forEach(function(x) {
		rms += Math.pow(x, 2);
		peak = x > peak ? x : peak;
	});
	rms = rms / ampSpectrum.length;
	rms = Math.sqrt(rms);
	return peak / rms;
}
//#endregion
//#region node_modules/meyda/dist/esm/featureExtractors.js
var featureExtractors_exports = /* @__PURE__ */ __exportAll({
	amplitudeSpectrum: () => amplitudeSpectrum,
	buffer: () => buffer,
	chroma: () => chroma_default,
	complexSpectrum: () => complexSpectrum,
	energy: () => energy_default,
	loudness: () => loudness_default,
	melBands: () => melBands_default,
	mfcc: () => mfcc_default,
	perceptualSharpness: () => perceptualSharpness_default,
	perceptualSpread: () => perceptualSpread_default,
	powerSpectrum: () => powerSpectrum_default,
	rms: () => rms_default,
	spectralCentroid: () => spectralCentroid_default,
	spectralCrest: () => spectralCrest_default,
	spectralFlatness: () => spectralFlatness_default,
	spectralFlux: () => spectralFlux_default,
	spectralKurtosis: () => spectralKurtosis_default,
	spectralRolloff: () => spectralRolloff_default,
	spectralSkewness: () => spectralSkewness_default,
	spectralSlope: () => spectralSlope_default,
	spectralSpread: () => spectralSpread_default,
	zcr: () => zcr_default
});
var buffer = function(args) {
	return args.signal;
};
var complexSpectrum = function(args) {
	return args.complexSpectrum;
};
var amplitudeSpectrum = function(args) {
	return args.ampSpectrum;
};
//#endregion
//#region node_modules/meyda/dist/esm/meyda-wa.js
var import_fft = require_fft();
/**
* Meyda's interface to the Web Audio API. MeydaAnalyzer abstracts an API on
* top of the Web Audio API's ScriptProcessorNode, running the Meyda audio
* feature extractors inside that context.
*
* MeydaAnalyzer's constructor should not be called directly - MeydaAnalyzer
* objects should be generated using the {@link createMeydaAnalyzer}
* factory function in the main Meyda class.
*
* Options are of type {@link MeydaAnalyzerOptions}.
*
* @example
* ```javascript
* const analyzer = Meyda.createMeydaAnalyzer({
*   "audioContext": audioContext,
*   "source": source,
*   "bufferSize": 512,
*   "featureExtractors": ["rms"],
*   "inputs": 2,
*   "numberOfMFCCCoefficients": 20
*   "callback": features => {
*     levelRangeElement.value = features.rms;
*   }
* });
* ```
*/
var MeydaAnalyzer = function() {
	/** @hidden */
	function MeydaAnalyzer(options, _this) {
		var _this_1 = this;
		this._m = _this;
		if (!options.audioContext) throw this._m.errors.noAC;
		else if (options.bufferSize && !isPowerOfTwo(options.bufferSize)) throw this._m._errors.notPow2;
		else if (!options.source) throw this._m._errors.noSource;
		this._m.audioContext = options.audioContext;
		this._m.bufferSize = options.bufferSize || this._m.bufferSize || 256;
		this._m.hopSize = options.hopSize || this._m.hopSize || this._m.bufferSize;
		this._m.sampleRate = options.sampleRate || this._m.audioContext.sampleRate || 44100;
		this._m.callback = options.callback;
		this._m.windowingFunction = options.windowingFunction || "hanning";
		this._m.featureExtractors = featureExtractors_exports;
		this._m.EXTRACTION_STARTED = options.startImmediately || false;
		this._m.channel = typeof options.channel === "number" ? options.channel : 0;
		this._m.inputs = options.inputs || 1;
		this._m.outputs = options.outputs || 1;
		this._m.numberOfMFCCCoefficients = options.numberOfMFCCCoefficients || this._m.numberOfMFCCCoefficients || 13;
		this._m.numberOfBarkBands = options.numberOfBarkBands || this._m.numberOfBarkBands || 24;
		this._m.spn = this._m.audioContext.createScriptProcessor(this._m.bufferSize, this._m.inputs, this._m.outputs);
		this._m.spn.connect(this._m.audioContext.destination);
		this._m._featuresToExtract = options.featureExtractors || [];
		this._m.barkScale = createBarkScale(this._m.bufferSize, this._m.sampleRate, this._m.bufferSize);
		this._m.melFilterBank = createMelFilterBank(Math.max(this._m.melBands, this._m.numberOfMFCCCoefficients), this._m.sampleRate, this._m.bufferSize);
		this._m.inputData = null;
		this._m.previousInputData = null;
		this._m.frame = null;
		this._m.previousFrame = null;
		this.setSource(options.source);
		this._m.spn.onaudioprocess = function(e) {
			var buffer;
			if (_this_1._m.inputData !== null) _this_1._m.previousInputData = _this_1._m.inputData;
			_this_1._m.inputData = e.inputBuffer.getChannelData(_this_1._m.channel);
			if (!_this_1._m.previousInputData) buffer = _this_1._m.inputData;
			else {
				buffer = new Float32Array(_this_1._m.previousInputData.length + _this_1._m.inputData.length - _this_1._m.hopSize);
				buffer.set(_this_1._m.previousInputData.slice(_this_1._m.hopSize));
				buffer.set(_this_1._m.inputData, _this_1._m.previousInputData.length - _this_1._m.hopSize);
			}
			frame(buffer, _this_1._m.bufferSize, _this_1._m.hopSize).forEach(function(f) {
				_this_1._m.frame = f;
				var features = _this_1._m.extract(_this_1._m._featuresToExtract, _this_1._m.frame, _this_1._m.previousFrame);
				if (typeof _this_1._m.callback === "function" && _this_1._m.EXTRACTION_STARTED) _this_1._m.callback(features);
				_this_1._m.previousFrame = _this_1._m.frame;
			});
		};
	}
	/**
	* Start feature extraction
	* The audio features will be passed to the callback function that was defined
	* in the MeydaOptions that were passed to the factory when constructing the
	* MeydaAnalyzer.
	* @param {(string|Array.<string>)} [features]
	* Change the features that Meyda is extracting. Defaults to the features that
	* were set upon construction in the options parameter.
	* @example
	* ```javascript
	* analyzer.start('chroma');
	* ```
	*/
	MeydaAnalyzer.prototype.start = function(features) {
		this._m._featuresToExtract = features || this._m._featuresToExtract;
		this._m.EXTRACTION_STARTED = true;
	};
	/**
	* Stop feature extraction.
	* @example
	* ```javascript
	* analyzer.stop();
	* ```
	*/
	MeydaAnalyzer.prototype.stop = function() {
		this._m.EXTRACTION_STARTED = false;
	};
	/**
	* Set the Audio Node for Meyda to listen to.
	* @param {AudioNode} source - The Audio Node for Meyda to listen to
	* @example
	* ```javascript
	* analyzer.setSource(audioSourceNode);
	* ```
	*/
	MeydaAnalyzer.prototype.setSource = function(source) {
		this._m.source && this._m.source.disconnect(this._m.spn);
		this._m.source = source;
		this._m.source.connect(this._m.spn);
	};
	/**
	* Set the channel of the audio node for Meyda to listen to
	* @param {number} channel - the index of the channel on the input audio node
	* for Meyda to listen to.
	* @example
	* ```javascript
	* analyzer.setChannel(0);
	* ```
	*/
	MeydaAnalyzer.prototype.setChannel = function(channel) {
		if (channel <= this._m.inputs) this._m.channel = channel;
		else console.error("Channel ".concat(channel, " does not exist. Make sure you've provided a value for 'inputs' that is greater than ").concat(channel, " when instantiating the MeydaAnalyzer"));
	};
	/**
	* Get a set of features from the current frame.
	* @param {(string|Array.<string>)} [features]
	* Change the features that Meyda is extracting
	* @example
	* ```javascript
	* analyzer.get('spectralFlatness');
	* ```
	*/
	MeydaAnalyzer.prototype.get = function(features) {
		if (this._m.inputData) return this._m.extract(features || this._m._featuresToExtract, this._m.inputData, this._m.previousInputData);
		else return null;
	};
	return MeydaAnalyzer;
}();
//#endregion
//#region node_modules/meyda/dist/esm/main.js
/**
* This file contains the default export for Meyda, you probably want to check
* out {@link default}
*
* @module Meyda
*/
var Meyda = {
	audioContext: null,
	spn: null,
	bufferSize: 512,
	sampleRate: 44100,
	melBands: 26,
	chromaBands: 12,
	callback: null,
	windowingFunction: "hanning",
	featureExtractors: featureExtractors_exports,
	EXTRACTION_STARTED: false,
	numberOfMFCCCoefficients: 13,
	numberOfBarkBands: 24,
	_featuresToExtract: [],
	windowing: applyWindow,
	/** @hidden */
	_errors: {
		notPow2: /* @__PURE__ */ new Error("Meyda: Buffer size must be a power of 2, e.g. 64 or 512"),
		featureUndef: /* @__PURE__ */ new Error("Meyda: No features defined."),
		invalidFeatureFmt: /* @__PURE__ */ new Error("Meyda: Invalid feature format"),
		invalidInput: /* @__PURE__ */ new Error("Meyda: Invalid input."),
		noAC: /* @__PURE__ */ new Error("Meyda: No AudioContext specified."),
		noSource: /* @__PURE__ */ new Error("Meyda: No source node specified.")
	},
	/**
	* @summary
	* Create a MeydaAnalyzer
	*
	* A factory function for creating a MeydaAnalyzer, the interface for using
	* Meyda in the context of Web Audio.
	*
	* ```javascript
	* const analyzer = Meyda.createMeydaAnalyzer({
	*   "audioContext": audioContext,
	*   "source": source,
	*   "bufferSize": 512,
	*   "featureExtractors": ["rms"],
	*   "inputs": 2,
	*   "callback": features => {
	*     levelRangeElement.value = features.rms;
	*   }
	* });
	* ```
	*/
	createMeydaAnalyzer,
	/**
	* List available audio feature extractors. Return format provides the key to
	* be used in selecting the extractor in the extract methods
	*/
	listAvailableFeatureExtractors,
	/**
	* Extract an audio feature from a buffer
	*
	* Unless `meyda.windowingFunction` is set otherwise, `extract` will
	* internally apply a hanning window to the buffer prior to conversion into
	* the frequency domain.
	*
	* ```javascript
	* meyda.bufferSize = 2048;
	* const features = meyda.extract(['zcr', 'spectralCentroid'], signal);
	* ```
	*/
	extract: function(feature, signal, previousSignal) {
		var _this = this;
		if (!signal) throw this._errors.invalidInput;
		else if (typeof signal != "object") throw this._errors.invalidInput;
		else if (!feature) throw this._errors.featureUndef;
		else if (!isPowerOfTwo(signal.length)) throw this._errors.notPow2;
		if (typeof this.barkScale == "undefined" || this.barkScale.length != this.bufferSize) this.barkScale = createBarkScale(this.bufferSize, this.sampleRate, this.bufferSize);
		if (typeof this.melFilterBank == "undefined" || this.barkScale.length != this.bufferSize || this.melFilterBank.length != this.melBands) this.melFilterBank = createMelFilterBank(Math.max(this.melBands, this.numberOfMFCCCoefficients), this.sampleRate, this.bufferSize);
		if (typeof this.chromaFilterBank == "undefined" || this.chromaFilterBank.length != this.chromaBands) this.chromaFilterBank = createChromaFilterBank(this.chromaBands, this.sampleRate, this.bufferSize);
		if ("buffer" in signal && typeof signal.buffer == "undefined") this.signal = arrayToTyped(signal);
		else this.signal = signal;
		var preparedSignal = prepareSignalWithSpectrum(signal, this.windowingFunction, this.bufferSize);
		this.signal = preparedSignal.windowedSignal;
		this.complexSpectrum = preparedSignal.complexSpectrum;
		this.ampSpectrum = preparedSignal.ampSpectrum;
		if (previousSignal) {
			var preparedSignal_1 = prepareSignalWithSpectrum(previousSignal, this.windowingFunction, this.bufferSize);
			this.previousSignal = preparedSignal_1.windowedSignal;
			this.previousComplexSpectrum = preparedSignal_1.complexSpectrum;
			this.previousAmpSpectrum = preparedSignal_1.ampSpectrum;
		}
		var extract = function(feature) {
			return _this.featureExtractors[feature]({
				ampSpectrum: _this.ampSpectrum,
				chromaFilterBank: _this.chromaFilterBank,
				complexSpectrum: _this.complexSpectrum,
				signal: _this.signal,
				bufferSize: _this.bufferSize,
				sampleRate: _this.sampleRate,
				barkScale: _this.barkScale,
				melFilterBank: _this.melFilterBank,
				previousSignal: _this.previousSignal,
				previousAmpSpectrum: _this.previousAmpSpectrum,
				previousComplexSpectrum: _this.previousComplexSpectrum,
				numberOfMFCCCoefficients: _this.numberOfMFCCCoefficients,
				numberOfBarkBands: _this.numberOfBarkBands
			});
		};
		if (typeof feature === "object") return feature.reduce(function(acc, el) {
			var _a;
			return Object.assign({}, acc, (_a = {}, _a[el] = extract(el), _a));
		}, {});
		else if (typeof feature === "string") return extract(feature);
		else throw this._errors.invalidFeatureFmt;
	}
};
var prepareSignalWithSpectrum = function(signal, windowingFunction, bufferSize) {
	var preparedSignal = {};
	if (typeof signal.buffer == "undefined") preparedSignal.signal = arrayToTyped(signal);
	else preparedSignal.signal = signal;
	preparedSignal.windowedSignal = applyWindow(preparedSignal.signal, windowingFunction);
	preparedSignal.complexSpectrum = (0, import_fft.fft)(preparedSignal.windowedSignal);
	preparedSignal.ampSpectrum = new Float32Array(bufferSize / 2);
	for (var i = 0; i < bufferSize / 2; i++) preparedSignal.ampSpectrum[i] = Math.sqrt(Math.pow(preparedSignal.complexSpectrum.real[i], 2) + Math.pow(preparedSignal.complexSpectrum.imag[i], 2));
	return preparedSignal;
};
/**
* List available audio feature extractors. Return format provides the key to
* be used in selecting the extractor in the extract methods
*/
function listAvailableFeatureExtractors() {
	return Object.keys(this.featureExtractors);
}
/**
* Create a MeydaAnalyzer
*
* A factory function for creating a MeydaAnalyzer, the interface for using
* Meyda in the context of Web Audio.
*
* ```javascript
* const analyzer = Meyda.createMeydaAnalyzer({
*   "audioContext": audioContext,
*   "source": source,
*   "bufferSize": 512,
*   "featureExtractors": ["rms"],
*   "inputs": 2,
*   "callback": features => {
*     levelRangeElement.value = features.rms;
*   }
* });
* ```
*/
function createMeydaAnalyzer(options) {
	return new MeydaAnalyzer(options, Object.assign({}, Meyda));
}
if (typeof window !== "undefined") window.Meyda = Meyda;
//#endregion
export { Meyda as t };
