window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-ide",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const _undefined$2 = /^undefined$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUndefined = /*@__PURE__*/ $constructor("$ZodUndefined", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = _undefined$2;
			inst._zod.values = /* @__PURE__ */ new Set([void 0]);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (typeof input === "undefined") return payload;
				payload.issues.push({
					expected: "undefined",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _undefined$1(Class, params) {
			return new Class({
				type: "undefined",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const undefinedProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") {
				if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
				else vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUndefined = /*@__PURE__*/ $constructor("ZodUndefined", (inst, def) => {
			$ZodUndefined.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => undefinedProcessor(inst, ctx, json, params);
		});
		function _undefined(params) {
			return /* @__PURE__ */ _undefined$1(ZodUndefined, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region ../ide/lib/typert.remote-client.js
		const _deepseek_ai_dsh_ide_ide_delete_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_delete_result$schema = object({
			"ok": boolean(),
			"stderr": string(),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_explore_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_explore_parameter_1$schema = union([
			_undefined(),
			literal(false),
			literal(true)
		]);
		const _deepseek_ai_dsh_ide_ide_explore_result$schema = object({
			"ok": boolean(),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitCommit_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitCommit_parameter_1$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitCommit_result$schema = object({
			"ok": boolean(),
			"stdout": string(),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitDiff_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitDiff_parameter_1$schema = union([_undefined(), string()]);
		const _deepseek_ai_dsh_ide_ide_gitDiff_result$schema = object({
			"stdout": string(),
			"ok": boolean(),
			"stderr": string(),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_1$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_2$schema = boolean();
		const _deepseek_ai_dsh_ide_ide_gitDiscard_result$schema = object({
			"ok": boolean(),
			"stderr": string(),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitStage_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitStage_parameter_1$schema = array(string());
		const _deepseek_ai_dsh_ide_ide_gitStage_result$schema = object({
			"ok": boolean(),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitStageAll_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitStageAll_result$schema = object({
			"ok": boolean(),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitStatus_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitStatus_result$schema = object({
			"branch": string(),
			"changes": array(object({
				"xy": string(),
				"path": string(),
				"renameFrom": string(),
				"staged": string(),
				"unstaged": string()
			})),
			"notRepo": boolean(),
			"error": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitUnstage_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitUnstage_parameter_1$schema = array(string());
		const _deepseek_ai_dsh_ide_ide_gitUnstage_result$schema = object({
			"ok": boolean(),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_gitUnstageAll_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_gitUnstageAll_result$schema = object({
			"ok": boolean(),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_listDir_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_listDir_result$schema = object({
			"path": string(),
			"entries": array(object({
				"name": string(),
				"type": union([literal("directory"), literal("file")]),
				"path": string(),
				"size": union([literal(null), number()])
			}))
		});
		const _deepseek_ai_dsh_ide_ide_mkdir_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_mkdir_result$schema = object({
			"ok": boolean(),
			"stderr": string(),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_newFile_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_newFile_result$schema = object({
			"ok": literal(true),
			"path": string()
		});
		const _deepseek_ai_dsh_ide_ide_paste_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_paste_result$schema = object({
			"ok": boolean(),
			"files": array(string()),
			"stderr": string()
		});
		const _deepseek_ai_dsh_ide_ide_readText_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_readText_result$schema = object({
			"path": string(),
			"content": string(),
			"truncated": boolean(),
			"size": number()
		});
		const _deepseek_ai_dsh_ide_ide_rename_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_rename_parameter_1$schema = string();
		const _deepseek_ai_dsh_ide_ide_rename_result$schema = object({
			"ok": boolean(),
			"stderr": string(),
			"from": string(),
			"to": string()
		});
		const _deepseek_ai_dsh_ide_ide_roots_result$schema = object({
			"root": string(),
			"workspaces": array(object({
				"id": string(),
				"title": string(),
				"path": string()
			}))
		});
		const _deepseek_ai_dsh_ide_ide_search_parameter_0$schema = string();
		const _deepseek_ai_dsh_ide_ide_search_parameter_1$schema = string();
		const _deepseek_ai_dsh_ide_ide_search_parameter_2$schema = boolean();
		const _deepseek_ai_dsh_ide_ide_search_result$schema = object({
			"error": string(),
			"matches": array(object({
				"path": string(),
				"line": number(),
				"text": string()
			})),
			"files": number(),
			"truncated": boolean()
		});
		const TYPERT_REMOTE = {
			package: "@deepseek-ai/dsh-ide",
			descriptors: [
				{
					id: "@deepseek-ai/dsh-ide#ide/delete",
					service: "ide",
					namespace: "ide",
					method: "delete",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/delete:path",
							schema: _deepseek_ai_dsh_ide_ide_delete_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/delete:result",
						schema: _deepseek_ai_dsh_ide_ide_delete_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 165,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/explore",
					service: "ide",
					namespace: "ide",
					method: "explore",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/explore:path",
							schema: _deepseek_ai_dsh_ide_ide_explore_parameter_0$schema
						}
					}, {
						name: "select",
						wire: "select",
						source: "json",
						acceptsUndefined: true,
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/explore:select",
							schema: _deepseek_ai_dsh_ide_ide_explore_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/explore:result",
						schema: _deepseek_ai_dsh_ide_ide_explore_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 177,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitCommit",
					service: "ide",
					namespace: "ide",
					method: "gitCommit",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitCommit:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitCommit_parameter_0$schema
						}
					}, {
						name: "message",
						wire: "message",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitCommit:message",
							schema: _deepseek_ai_dsh_ide_ide_gitCommit_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitCommit:result",
						schema: _deepseek_ai_dsh_ide_ide_gitCommit_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 271,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitDiff",
					service: "ide",
					namespace: "ide",
					method: "gitDiff",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiff:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitDiff_parameter_0$schema
						}
					}, {
						name: "path",
						wire: "path",
						source: "json",
						acceptsUndefined: true,
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiff:path",
							schema: _deepseek_ai_dsh_ide_ide_gitDiff_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#GitDiffResult",
						schema: _deepseek_ai_dsh_ide_ide_gitDiff_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 227,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitDiscard",
					service: "ide",
					namespace: "ide",
					method: "gitDiscard",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "cwd",
							wire: "cwd",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiscard:cwd",
								schema: _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_0$schema
							}
						},
						{
							name: "path",
							wire: "path",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiscard:path",
								schema: _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_1$schema
							}
						},
						{
							name: "untracked",
							wire: "untracked",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiscard:untracked",
								schema: _deepseek_ai_dsh_ide_ide_gitDiscard_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitDiscard:result",
						schema: _deepseek_ai_dsh_ide_ide_gitDiscard_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 260,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitStage",
					service: "ide",
					namespace: "ide",
					method: "gitStage",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStage:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitStage_parameter_0$schema
						}
					}, {
						name: "paths",
						wire: "paths",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStage:paths",
							schema: _deepseek_ai_dsh_ide_ide_gitStage_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStage:result",
						schema: _deepseek_ai_dsh_ide_ide_gitStage_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 234,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitStageAll",
					service: "ide",
					namespace: "ide",
					method: "gitStageAll",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStageAll:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitStageAll_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStageAll:result",
						schema: _deepseek_ai_dsh_ide_ide_gitStageAll_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 248,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitStatus",
					service: "ide",
					namespace: "ide",
					method: "gitStatus",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitStatus:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitStatus_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#GitStatusResult",
						schema: _deepseek_ai_dsh_ide_ide_gitStatus_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 191,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitUnstage",
					service: "ide",
					namespace: "ide",
					method: "gitUnstage",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitUnstage:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitUnstage_parameter_0$schema
						}
					}, {
						name: "paths",
						wire: "paths",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitUnstage:paths",
							schema: _deepseek_ai_dsh_ide_ide_gitUnstage_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitUnstage:result",
						schema: _deepseek_ai_dsh_ide_ide_gitUnstage_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 241,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/gitUnstageAll",
					service: "ide",
					namespace: "ide",
					method: "gitUnstageAll",
					invocation: { kind: "direct" },
					parameters: [{
						name: "cwd",
						wire: "cwd",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/gitUnstageAll:cwd",
							schema: _deepseek_ai_dsh_ide_ide_gitUnstageAll_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/gitUnstageAll:result",
						schema: _deepseek_ai_dsh_ide_ide_gitUnstageAll_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 254,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/listDir",
					service: "ide",
					namespace: "ide",
					method: "listDir",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/listDir:path",
							schema: _deepseek_ai_dsh_ide_ide_listDir_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#ListDirResult",
						schema: _deepseek_ai_dsh_ide_ide_listDir_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 114,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/mkdir",
					service: "ide",
					namespace: "ide",
					method: "mkdir",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/mkdir:path",
							schema: _deepseek_ai_dsh_ide_ide_mkdir_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/mkdir:result",
						schema: _deepseek_ai_dsh_ide_ide_mkdir_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 159,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/newFile",
					service: "ide",
					namespace: "ide",
					method: "newFile",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/newFile:path",
							schema: _deepseek_ai_dsh_ide_ide_newFile_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/newFile:result",
						schema: _deepseek_ai_dsh_ide_ide_newFile_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 150,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/paste",
					service: "ide",
					namespace: "ide",
					method: "paste",
					invocation: { kind: "direct" },
					parameters: [{
						name: "dest",
						wire: "dest",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/paste:dest",
							schema: _deepseek_ai_dsh_ide_ide_paste_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/paste:result",
						schema: _deepseek_ai_dsh_ide_ide_paste_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 184,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/readText",
					service: "ide",
					namespace: "ide",
					method: "readText",
					invocation: { kind: "direct" },
					parameters: [{
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/readText:path",
							schema: _deepseek_ai_dsh_ide_ide_readText_parameter_0$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#ReadTextResult",
						schema: _deepseek_ai_dsh_ide_ide_readText_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 137,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/rename",
					service: "ide",
					namespace: "ide",
					method: "rename",
					invocation: { kind: "direct" },
					parameters: [{
						name: "from",
						wire: "from",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/rename:from",
							schema: _deepseek_ai_dsh_ide_ide_rename_parameter_0$schema
						}
					}, {
						name: "to",
						wire: "to",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "@deepseek-ai/dsh-ide#ide/rename:to",
							schema: _deepseek_ai_dsh_ide_ide_rename_parameter_1$schema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide#ide/rename:result",
						schema: _deepseek_ai_dsh_ide_ide_rename_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 171,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/roots",
					service: "ide",
					namespace: "ide",
					method: "roots",
					invocation: { kind: "direct" },
					parameters: [],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#RootsResult",
						schema: _deepseek_ai_dsh_ide_ide_roots_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 98,
						"column": 9
					}
				},
				{
					id: "@deepseek-ai/dsh-ide#ide/search",
					service: "ide",
					namespace: "ide",
					method: "search",
					invocation: { kind: "direct" },
					parameters: [
						{
							name: "cwd",
							wire: "cwd",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/search:cwd",
								schema: _deepseek_ai_dsh_ide_ide_search_parameter_0$schema
							}
						},
						{
							name: "query",
							wire: "query",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/search:query",
								schema: _deepseek_ai_dsh_ide_ide_search_parameter_1$schema
							}
						},
						{
							name: "caseSensitive",
							wire: "caseSensitive",
							source: "json",
							codec: {
								mode: "strict",
								typeSymbol: "@deepseek-ai/dsh-ide#ide/search:caseSensitive",
								schema: _deepseek_ai_dsh_ide_ide_search_parameter_2$schema
							}
						}
					],
					result: {
						mode: "strict",
						typeSymbol: "@deepseek-ai/dsh-ide/types#SearchResult",
						schema: _deepseek_ai_dsh_ide_ide_search_result$schema
					},
					sourceLocation: {
						"file": "packages/host/ide/src/index.ts",
						"line": 279,
						"column": 9
					}
				}
			]
		};
		//#endregion
		//#region src/client/stores.ts
		/** Create one editor-tab store instance. */
		function createIdeStore() {
			let tabs = [];
			let activeId = null;
			const listeners = [];
			const emit = () => {
				for (const fn of listeners) try {
					fn();
				} catch {}
			};
			return {
				get tabs() {
					return tabs;
				},
				get activeId() {
					return activeId;
				},
				subscribe(fn) {
					listeners.push(fn);
					return () => {
						const i = listeners.indexOf(fn);
						if (i >= 0) listeners.splice(i, 1);
					};
				},
				add(tab) {
					if (tabs.find((t) => t.key === tab.key)) {
						activeId = tab.key;
						emit();
						return;
					}
					tabs = [...tabs, tab];
					activeId = tab.key;
					emit();
				},
				close(key) {
					const i = tabs.findIndex((t) => t.key === key);
					if (i < 0) return;
					const next = [...tabs.slice(0, i), ...tabs.slice(i + 1)];
					tabs = next;
					if (activeId === key) {
						const n = next[i] ?? next[i - 1];
						activeId = n ? n.key : null;
					}
					emit();
				},
				setActive(key) {
					if (activeId !== key) {
						activeId = key;
						emit();
					}
				}
			};
		}
		//#endregion
		//#region src/client/lib.ts
		/**
		* Shared leaf: pure helpers and wire types for the IDE sidebar / editor
		* column. No React state, no ctx, no side effects — everything here is a
		* pure function or a plain data shape.
		* @module @deepseek-ai/dsh-client-ui-ide/client/lib
		*/
		/** Unwrap a Remote result envelope: a Host throw becomes { ok:false, error }. */
		async function rpc(p) {
			const r = await p;
			if (!r.ok) throw new Error(r.error.message);
			return r.value;
		}
		function relTime(ts) {
			if (!ts) return "";
			const diff = Date.now() - ts;
			const m = 6e4, h = 36e5, d = 864e5;
			if (diff < m) return "刚刚";
			if (diff < h) return `${Math.floor(diff / m)} 分钟前`;
			if (diff < d) return `${Math.floor(diff / h)} 小时前`;
			if (diff < 30 * d) return `${Math.floor(diff / d)} 天前`;
			return new Date(ts).toLocaleDateString();
		}
		const joinPath = (dir, name) => dir.replace(/[\\/]+$/, "") + "\\" + name;
		const dirnameOf = (p) => {
			const i = Math.max(p.lastIndexOf("\\"), p.lastIndexOf("/"));
			return i < 0 ? p : p.slice(0, i);
		};
		const baseName = (p) => {
			const s = p.replace(/[\\/]+$/, "");
			const i = Math.max(s.lastIndexOf("\\"), s.lastIndexOf("/"));
			return i < 0 ? s : s.slice(i + 1);
		};
		function detectLang(path) {
			const p = (path || "").toLowerCase();
			if (/\.(js|jsx|mjs|cjs|ts|tsx)$/.test(p)) return "js";
			if (/\.json$/.test(p)) return "json";
			if (/\.(md|markdown)$/.test(p)) return "md";
			if (/\.(css|scss|less)$/.test(p)) return "css";
			if (/\.(html|htm|vue)$/.test(p)) return "html";
			if (/\.py$/.test(p)) return "py";
			if (/\.(sh|bash|zsh)$/.test(p)) return "sh";
			if (/\.ya?ml$/.test(p)) return "yaml";
			return "text";
		}
		const KW = {
			js: "const let var function return if else for while do class extends super import export from default new try catch finally throw async await typeof instanceof in of this delete void yield switch case break continue",
			py: "def return if elif else for while import from class try except finally raise with as lambda pass break continue global not and or in is del yield async await",
			sh: "if then else elif fi for while do done case esac function export local return echo cd source"
		};
		function buildRules(lang) {
			if (lang === "text") return [];
			if (lang === "md") return [
				[/^#{1,6}[^\n]*/g, "tok-md-heading"],
				[/`[^`\n]*`/g, "tok-str"],
				[/\*\*[^*\n]+\*\*/g, "tok-bold"],
				[/\[[^\]]*\]\([^)]*\)/g, "tok-link"],
				[/^>\s?[^\n]*/g, "tok-com"]
			];
			if (lang === "json") return [
				[/"(?:[^"\\]|\\.)*"(?=\s*:)/g, "tok-json-key"],
				[/"(?:[^"\\]|\\.)*"/g, "tok-str"],
				[/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi, "tok-num"],
				[/\b(?:true|false|null)\b/g, "tok-bool"]
			];
			if (lang === "html") return [
				[/<!--[\s\S]*?-->/g, "tok-com"],
				[/<\/?[a-zA-Z][a-zA-Z0-9-]*/g, "tok-tag"],
				[/\/?>/g, "tok-tag"],
				[/[a-zA-Z-]+(?==")/g, "tok-attr"],
				[/"[^"]*"/g, "tok-str"]
			];
			if (lang === "css") return [
				[/\/\*[\s\S]*?\*\//g, "tok-com"],
				[/[a-zA-Z-]+(?=\s*:)/g, "tok-prop"],
				[/#[0-9a-fA-F]{3,8}\b/g, "tok-num"],
				[/-?\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|fr)?\b/gi, "tok-num"],
				[/"[^"]*"|'[^']*'/g, "tok-str"]
			];
			const kws = ((KW[lang] ?? KW.js) || "").split(" ").join("|");
			return [
				[/\/\*[\s\S]*?\*\//g, "tok-com"],
				[lang === "py" || lang === "sh" || lang === "yaml" ? /#[^\n]*/g : /\/\/[^\n]*/g, "tok-com"],
				[/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, "tok-str"],
				[new RegExp(`\\b(?:${kws})\\b`, "g"), "tok-kw"],
				[/-?\b\d+(?:\.\d+)?\b/g, "tok-num"]
			];
		}
		function tokenize(line, rules) {
			const out = [];
			let i = 0;
			const n = line.length;
			while (i < n) {
				let best = null;
				for (const r of rules) {
					r[0].lastIndex = i;
					const m = r[0].exec(line);
					if (m && m.index === i && (best === null || m[0].length > best[0].length)) best = [m[0], r[1]];
				}
				if (best) {
					out.push(best);
					i += best[0].length;
				} else {
					out.push([line[i] ?? "", null]);
					i += 1;
				}
			}
			return out;
		}
		/** Render one source line with token spans. */
		function renderLine(line, lang) {
			const segs = tokenize(line, buildRules(lang));
			return (0, react.createElement)("span", { className: "dshide-linetext" }, segs.map((s, i) => s[1] ? (0, react.createElement)("span", {
				key: i,
				className: s[1]
			}, s[0] ?? "") : s[0] ?? ""));
		}
		//#endregion
		//#region src/client/icons.tsx
		/**
		* Icon glyphs: native DSH `ic_ds_*`-style 16/14 viewBox paths, rendered as
		* inline SVG. Pure presentation — no state, no ctx.
		* @module @deepseek-ai/dsh-client-ui-ide/client/icons
		*/
		const P = (d) => ({
			d,
			fill: "currentColor"
		});
		const ICONS = {
			explorer: {
				vb: "0 0 16 16",
				p: [["path", P("M5.19629 1.57104C5.81144 1.5711 6.38623 1.8786 6.72754 2.39038L7.19922 3.09839C7.28454 3.22635 7.42824 3.30344 7.58203 3.30347H12.1699C13.5039 3.30348 14.5859 4.38548 14.5859 5.71948V6.62671C15.2694 7.02689 15.6605 7.85012 15.4385 8.68726L14.3848 12.658C14.1037 13.7164 13.1449 14.4527 12.0498 14.4529H2.91699C1.51651 14.4529 0.451662 13.2814 0.501954 11.9519V3.98706C0.501954 2.65305 1.58396 1.57104 2.91797 1.57104H5.19629ZM3.7793 7.75562C3.30994 7.75562 2.89883 8.07153 2.77832 8.52515L1.91602 11.7722C1.74167 12.4291 2.23734 13.073 2.91699 13.073H12.0498C12.5191 13.0728 12.9304 12.757 13.0508 12.3035L14.1045 8.33374C14.1819 8.04202 13.9619 7.756 13.6602 7.75562H3.7793ZM2.91797 2.9519C2.34625 2.9519 1.88281 3.41534 1.88281 3.98706V7.2937C2.33068 6.7269 3.02249 6.37476 3.7793 6.37476H13.2051V5.71948C13.2051 5.14777 12.7416 4.68434 12.1699 4.68433H7.58203C6.96675 4.6843 6.39209 4.37595 6.05078 3.86401L5.5791 3.15601C5.49379 3.02821 5.34995 2.95196 5.19629 2.9519H2.91797Z")]]
			},
			search: {
				vb: "0 0 16 16",
				p: [["path", P("M11.894845 6.647401C11.894845 3.725463 9.534486 1.356779 6.623219 1.35657C3.711786 1.35657 1.351635 3.725338 1.351635 6.647401C1.351843 9.569296 3.711911 11.938273 6.623219 11.938273C9.534361 11.938064 11.894637 9.569171 11.894845 6.647401ZM13.245462 6.647401C13.245254 10.317935 10.280401 13.293613 6.623219 13.293821C2.965871 13.293821 0.000204 10.31806 0 6.647401C0 2.976574 2.965746 0 6.623219 0C10.280526 0.000205 13.245462 2.9767 13.245462 6.647401Z")], ["path", P("M16.000417 15.041079L15.044449 16.000433L11.530434 12.473588L12.486298 11.514234L16.000417 15.041079Z")]]
			},
			scm: {
				vb: "0 0 16 16",
				p: [["path", {
					fillRule: "evenodd",
					clipRule: "evenodd",
					fill: "currentColor",
					d: "M13.0762 1.37207C14.0846 1.37228 14.9021 2.19077 14.9023 3.19922C14.9022 4.20772 14.0847 5.02518 13.0762 5.02539C12.2967 5.02539 11.6325 4.53691 11.3701 3.84961H4.35547C4.79397 4.26458 5.15861 4.7644 5.41699 5.33496L7.10645 9.06738C7.88526 10.7875 9.55104 11.9228 11.4189 12.0371C11.7085 11.4109 12.3411 10.9756 13.0762 10.9756C14.0843 10.9759 14.9023 11.7936 14.9023 12.8018C14.9023 13.81 14.0843 14.6277 13.0762 14.6279C12.2534 14.6279 11.5574 14.0832 11.3291 13.335C8.9868 13.1879 6.89981 11.7612 5.92285 9.60352L4.23242 5.87109C3.67503 4.64033 2.44878 3.84961 1.09766 3.84961V2.54883C1.10665 2.54883 1.11601 2.54975 1.125 2.5498L11.3701 2.54883C11.6326 1.86151 12.2969 1.37207 13.0762 1.37207ZM13.0762 12.2764C12.7858 12.2764 12.5508 12.5114 12.5508 12.8018C12.5508 13.0921 12.7858 13.3281 13.0762 13.3281C13.3664 13.3279 13.6025 13.092 13.6025 12.8018C13.6025 12.5115 13.3664 12.2766 13.0762 12.2764ZM13.0762 2.67285C12.7855 2.67285 12.55 2.90861 12.5498 3.19922C12.5499 3.48987 12.7855 3.72559 13.0762 3.72559C13.3667 3.72538 13.6024 3.48975 13.6025 3.19922C13.6023 2.90874 13.3666 2.67306 13.0762 2.67285Z"
				}]]
			},
			chat: {
				vb: "0 0 16 16",
				p: [["path", P("M8.00003 0.3237C3.76075 0.3237 0.32373 3.76072 0.32373 8C0.32373 9.17603 0.589121 10.2922 1.0632 11.2901L1.35291 11.8989L2.5705 11.3205L2.28079 10.7117C1.89079 9.89074 1.67301 8.97167 1.67301 8C1.67301 4.50546 4.50549 1.67298 8.00003 1.67298C11.4946 1.67298 14.3271 4.50546 14.3271 8C14.3271 11.4945 11.4946 14.327 8.00003 14.327C7.28473 14.327 6.76077 14.277 6.29621 14.1487C5.83857 14.0224 5.40441 13.8109 4.88514 13.4488C4.12569 12.919 3.03778 12.7316 2.141 13.2978L2.12682 13.307L2.11264 13.3171L1.34886 13.854L1.79659 15.188L2.86122 14.4384C3.19068 14.2305 3.68325 14.2542 4.11326 14.5539C4.72789 14.9826 5.30042 15.2724 5.93762 15.4484C6.56803 15.6224 7.22776 15.6763 8.00003 15.6763C12.2393 15.6763 15.6763 12.2393 15.6763 8C15.6763 3.76072 12.2393 0.3237 8.00003 0.3237ZM7.32033 4.82535V7.32536H4.82538V8.67464H7.32033V11.1747H8.6696V8.67464H11.1747V7.32536H8.6696V4.82535H7.32033Z")]]
			},
			folder: {
				vb: "0 0 16 16",
				p: [["path", {
					transform: "translate(1.5 2.429)",
					fill: "currentColor",
					d: "M5.05582 0.518756L4.50669 0.86654L5.05582 0.518756ZM13 9.4837L13.65 9.4837L13.65 3.53962L13 3.53962L12.35 3.53962L12.35 9.4837L13 9.4837ZM11.3264 1.86603L11.3264 1.21603L6.52313 1.21603L6.52313 1.86603L6.52313 2.51603L11.3264 2.51603L11.3264 1.86603ZM5.58054 1.34727L6.12968 0.999489L5.60495 0.170972L5.05582 0.518756L4.50669 0.86654L5.03141 1.69506L5.58054 1.34727ZM4.11323 1.23058e-13L4.11323 -0.65L1.67359 -0.65L1.67359 5.00699e-14L1.67359 0.65L4.11323 0.65L4.11323 1.23058e-13ZM0 1.67359L-0.65 1.67359L-0.65 9.4837L0 9.4837L0.65 9.4837L0.65 1.67359L0 1.67359ZM11.3264 11.1573L11.3264 10.5073L1.67359 10.5073L1.67359 11.1573L1.67359 11.8073L11.3264 11.8073L11.3264 11.1573ZM0 9.4837L-0.65 9.4837C-0.65 10.767 0.390308 11.8073 1.67359 11.8073L1.67359 11.1573L1.67359 10.5073C1.10828 10.5073 0.65 10.049 0.65 9.4837L0 9.4837ZM1.67359 5.00699e-14L1.67359 -0.65C0.390307 -0.65 -0.65 0.390309 -0.65 1.67359L0 1.67359L0.65 1.67359C0.65 1.10828 1.10828 0.65 1.67359 0.65L1.67359 5.00699e-14ZM5.05582 0.518756L5.60495 0.170972C5.28121 -0.340193 4.71829 -0.65 4.11323 -0.65L4.11323 1.23058e-13L4.11323 0.65C4.27282 0.65 4.4213 0.731715 4.50669 0.86654L5.05582 0.518756ZM6.52313 1.86603L6.52313 1.21603C6.36354 1.21603 6.21507 1.13431 6.12968 0.999489L5.58054 1.34727L5.03141 1.69506C5.35515 2.20622 5.91808 2.51603 6.52313 2.51603L6.52313 1.86603ZM13 3.53962L13.65 3.53962C13.65 2.25634 12.6097 1.21603 11.3264 1.21603L11.3264 1.86603L11.3264 2.51603C11.8917 2.51603 12.35 2.97431 12.35 3.53962L13 3.53962ZM13 9.4837L12.35 9.4837C12.35 10.049 11.8917 10.5073 11.3264 10.5073L11.3264 11.1573L11.3264 11.8073C12.6097 11.8073 13.65 10.767 13.65 9.4837L13 9.4837Z"
				}]]
			},
			file: {
				vb: "0 0 16 16",
				p: [["path", {
					fillRule: "evenodd",
					clipRule: "evenodd",
					fill: "currentColor",
					d: "M12.3368 1.53569L11.931 4.43172H14.8086V5.79673H11.7404L11.1962 9.67859H14.2839V11.0436H11.0056L10.4994 14.6529L9.14873 14.4643L9.62731 11.0436H5.75876L5.25252 14.6529L3.90186 14.4643L4.38043 11.0436H1.69141V9.67859H4.57104L5.11417 5.79673H2.21609V4.43172H5.30581L5.73724 1.34713L7.08995 1.53569L6.68414 4.43172H10.5527L10.9841 1.34713L12.3368 1.53569ZM5.94937 9.67859H9.81791L10.361 5.79673H6.49353L5.94937 9.67859Z"
				}]]
			},
			plus: {
				vb: "0 0 16 16",
				p: [["path", P("M8.64453 1.5V7.34961H14.5V8.65039H8.64453V14.5H7.34473V8.65039H1.5V7.34961H7.34473V1.5H8.64453Z")]]
			},
			minus: {
				vb: "0 0 16 16",
				p: [["path", P("M3.5 7.35H12.5V8.65H3.5Z")]]
			},
			check: {
				vb: "0 0 16 16",
				p: [["path", P("M15.0498 3.92579L8.49512 12.3818C8.25774 12.6881 8.04517 12.9645 7.84668 13.1689C7.63957 13.3823 7.38732 13.5841 7.04492 13.6719C6.86373 13.7183 6.6757 13.7346 6.48926 13.7197C6.13666 13.6915 5.8528 13.5355 5.6123 13.3604C5.38201 13.1926 5.12573 12.9567 4.83984 12.6953L1.03125 9.21289L1.96875 8.1875L5.77734 11.6699C6.08684 11.9529 6.27773 12.1249 6.43066 12.2363C6.50183 12.2882 6.54699 12.3135 6.57324 12.3252C6.58525 12.3305 6.59269 12.3322 6.5957 12.333C6.59802 12.3336 6.59961 12.334 6.59961 12.334C6.63317 12.3367 6.66758 12.3335 6.7002 12.3252C6.7002 12.3252 6.70211 12.3251 6.7041 12.3242C6.70698 12.3229 6.71348 12.319 6.72461 12.3115C6.74849 12.2956 6.78843 12.2642 6.84961 12.2012C6.98138 12.0654 7.13957 11.8628 7.39648 11.5313L13.9502 3.07422L15.0498 3.92579Z")]]
			},
			edit: {
				vb: "0 0 16 16",
				p: [["path", P("M9.94076 1.34942C10.7047 0.90231 11.6503 0.902415 12.4143 1.34942C12.7061 1.52015 12.9688 1.79118 13.3104 2.13284C13.6521 2.47448 13.9231 2.73721 14.0939 3.02894C14.5408 3.79294 14.5409 4.73856 14.0939 5.50251C13.9231 5.79415 13.652 6.05704 13.3104 6.39861L6.65932 13.0497C6.28068 13.4284 6.00695 13.7108 5.66543 13.9097C5.32391 14.1085 4.94315 14.2074 4.42705 14.3498L3.24394 14.6761C2.77527 14.8054 2.34538 14.9262 2.00131 14.9684C1.65196 15.0112 1.17964 15.0013 0.810764 14.6325C0.441921 14.2637 0.432107 13.7913 0.47486 13.442C0.517035 13.0979 0.6379 12.668 0.767181 12.1993L1.09352 11.0162C1.23588 10.5001 1.33481 10.1193 1.5336 9.77784C1.7325 9.43632 2.0149 9.1626 2.39355 8.78395L9.04466 2.13284C9.38625 1.79126 9.64911 1.52016 9.94076 1.34942ZM15.5427 14.8398H7.55223L8.96707 13.425H15.5427V14.8398ZM3.39382 9.78422C2.965 10.213 2.84244 10.3436 2.75709 10.49C2.67183 10.6366 2.61862 10.8079 2.45733 11.3925L2.13099 12.5756C2.00183 13.0439 1.92194 13.3419 1.88863 13.5536C2.10041 13.5204 2.39872 13.4416 2.86764 13.3123L4.05075 12.9859C4.63544 12.8246 4.80669 12.7715 4.95323 12.6862C5.09968 12.6008 5.23022 12.4783 5.65905 12.0494L10.721 6.98644L8.45577 4.72121L3.39382 9.78422ZM11.7 2.57079C11.3774 2.38198 10.9777 2.38198 10.6551 2.57079C10.5602 2.62647 10.4487 2.72931 10.0449 3.13311L9.45604 3.72094L11.7213 5.98617L12.3102 5.39833C12.7139 4.99457 12.8168 4.88307 12.8725 4.78818C13.0613 4.46561 13.0612 4.06585 12.8725 3.74326C12.8169 3.64827 12.7146 3.53752 12.3102 3.13311C11.9057 2.72863 11.795 2.6264 11.7 2.57079Z")]]
			},
			trash: {
				vb: "0 0 16 16",
				p: [["path", P("M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 13.9714 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z")]]
			},
			refresh: {
				vb: "0 0 16 16",
				p: [["path", P("M7.92136 0.349152C10.3744 0.349234 12.5564 1.5052 13.9557 3.29894L15.1281 2.12759C15.3303 1.92546 15.6767 2.06943 15.6767 2.35538V5.53923C15.6766 5.71626 15.5329 5.85976 15.3559 5.86002H12.171C11.8854 5.8597 11.7426 5.51465 11.9443 5.31249L12.9641 4.29056C11.8237 2.74305 9.98908 1.74106 7.92136 1.74097C4.46436 1.74097 1.66233 4.543 1.66233 8C1.66233 11.457 4.46436 14.259 7.92136 14.259C11.3782 14.2589 14.1804 11.4569 14.1804 8H15.5722C15.5722 12.2251 12.1465 15.6507 7.92136 15.6508C3.69614 15.6508 0.270508 12.2252 0.270508 8C0.270508 3.77478 3.69614 0.349152 7.92136 0.349152Z")]]
			},
			close: {
				vb: "0 0 16 16",
				p: [["path", P("M14.1168 13.197L13.197 14.1167L1.8833 2.80303L2.80309 1.88324L14.1168 13.197Z")], ["path", P("M13.197 1.88326L14.1168 2.80305L2.80309 14.1168L1.8833 13.197L13.197 1.88326Z")]]
			},
			chevron: {
				vb: "0 0 14 14",
				p: [["path", P("M4.25 2.82782L4.25 11.1722C4.25 11.6622 4.84243 11.9076 5.18891 11.5611L9.36109 7.38891C9.57588 7.17412 9.57588 6.82588 9.36109 6.61109L5.18891 2.43891C4.84243 2.09243 4.25 2.33782 4.25 2.82782Z")]]
			},
			back: {
				vb: "0 0 14 14",
				p: [["path", P("M8.5 2.15137L8.07617 2.57617L5.34863 5.30273C5.09294 5.55843 4.86618 5.78438 4.70215 5.98828C4.53117 6.20088 4.38244 6.44405 4.33398 6.75C4.30778 6.91565 4.30778 7.08435 4.33398 7.25C4.38244 7.55595 4.53117 7.79912 4.70215 8.01172C4.86618 8.21561 5.09294 8.44157 5.34863 8.69727L8.07617 11.4238L8.5 11.8486L9.34863 11L8.92383 10.5762L6.19727 7.84863C5.92268 7.57405 5.75151 7.40124 5.6377 7.25977C5.53096 7.12709 5.52187 7.07728 5.51953 7.0625C5.51297 7.02105 5.51297 6.97895 5.51953 6.9375C5.52187 6.92272 5.53096 6.87291 5.6377 6.74023C5.75152 6.59876 5.92268 6.42595 6.19727 6.15137L8.92383 3.42383L9.34863 3L8.5 2.15137Z")]]
			},
			locate: {
				vb: "0 0 16 16",
				p: [["circle", {
					cx: 8,
					cy: 8,
					r: 5,
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.3
				}], ["path", {
					d: "M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: 1.3,
					strokeLinecap: "round"
				}]]
			}
		};
		/** Inline SVG icon by name. */
		function Icon(props) {
			const def = ICONS[props.name];
			if (!def) return null;
			return (0, react.createElement)("svg", {
				viewBox: def.vb,
				width: props.size ?? 16,
				height: props.size ?? 16,
				className: props.className,
				"aria-hidden": true,
				fill: "none",
				style: Object.assign({
					display: "block",
					flex: "none"
				}, props.style ?? {})
			}, def.p.map((s, i) => (0, react.createElement)(s[0], Object.assign({ key: i }, s[1]))));
		}
		//#endregion
		//#region src/client/views.tsx
		/**
		* Sidebar views: Explorer (file tree), Search, Source Control, Sessions.
		* Pure presentation — all data and callbacks arrive through props (the
		* registrant inject face + framework hook snapshots). No ctx reach.
		* @module @deepseek-ai/dsh-client-ui-ide/client/views
		*/
		function Tree(props) {
			const { ide, rpc } = props.injected;
			const el = react.createElement;
			const isOpen = props.depth === 0 || props.expanded.has(props.path);
			const [entries, setEntries] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				let cancelled = false;
				setEntries(void 0);
				rpc(ide.listDir(props.path)).then((r) => {
					if (!cancelled) setEntries(r.entries ?? []);
				}, () => {
					if (!cancelled) setEntries([]);
				});
				return () => {
					cancelled = true;
				};
			}, [props.path, isOpen]);
			const f = (props.filter ?? "").toLowerCase();
			const visible = (entries ?? []).filter((e) => (props.showHidden || !(e.name.length > 0 && e.name[0] === ".")) && (f === "" || e.name.toLowerCase().includes(f)));
			return el("div", null, entries === void 0 ? el("div", { className: "dshide-loading" }, "加载中…") : visible.map((e) => {
				if (e.type === "directory") {
					const open = props.expanded.has(e.path);
					return el("div", { key: e.path }, el("div", {
						className: "dshide-row",
						style: { paddingLeft: `${props.depth * 12 + 8}px` },
						draggable: true,
						onDragStart: (ev) => {
							ev.dataTransfer.setData("text/plain", e.path);
							ev.dataTransfer.effectAllowed = "move";
						},
						onDragOver: (ev) => {
							ev.preventDefault();
							ev.dataTransfer.dropEffect = "move";
						},
						onDrop: (ev) => {
							ev.preventDefault();
							props.onMove(ev.dataTransfer.getData("text/plain"), e.path);
						},
						onClick: () => {
							props.toggle(e.path);
						}
					}, el("span", { className: `dshide-arrow${open ? " open" : ""}` }, el(Icon, {
						name: "chevron",
						size: 12
					})), el(Icon, {
						name: "folder",
						size: 15,
						className: "dshide-glyph"
					}), el("span", { className: "dshide-name" }, e.name), el("span", {
						className: "dshide-row-actions",
						onClick: (ev) => {
							ev.stopPropagation();
						}
					}, el("button", {
						type: "button",
						className: "dshide-row-btn",
						title: "在资源管理器中打开",
						onClick: (ev) => {
							ev.stopPropagation();
							rpc(ide.explore(e.path, false));
						}
					}, el(Icon, {
						name: "locate",
						size: 13
					})), el("button", {
						type: "button",
						className: "dshide-row-btn",
						title: "重命名",
						onClick: (ev) => {
							ev.stopPropagation();
							props.onRename(e.path, e.name);
						}
					}, el(Icon, {
						name: "edit",
						size: 13
					})), el("button", {
						type: "button",
						className: "dshide-row-btn",
						title: "删除",
						onClick: (ev) => {
							ev.stopPropagation();
							props.onDelete(e.path, e.name);
						}
					}, el(Icon, {
						name: "trash",
						size: 13
					})))), open ? el(Tree, {
						path: e.path,
						depth: props.depth + 1,
						expanded: props.expanded,
						toggle: props.toggle,
						onOpen: props.onOpen,
						showHidden: props.showHidden,
						filter: props.filter,
						onRename: props.onRename,
						onDelete: props.onDelete,
						onMove: props.onMove,
						injected: props.injected
					}) : null);
				}
				return el("div", {
					key: e.path,
					className: "dshide-row",
					style: { paddingLeft: `${props.depth * 12 + 8 + 14}px` },
					draggable: true,
					onDragStart: (ev) => {
						ev.dataTransfer.setData("text/plain", e.path);
						ev.dataTransfer.effectAllowed = "move";
					},
					onClick: () => {
						props.onOpen(e.path);
					}
				}, el(Icon, {
					name: "file",
					size: 15,
					className: "dshide-glyph"
				}), el("span", { className: "dshide-name" }, e.name), el("span", {
					className: "dshide-row-actions",
					onClick: (ev) => {
						ev.stopPropagation();
					}
				}, el("button", {
					type: "button",
					className: "dshide-row-btn",
					title: "在资源管理器中显示",
					onClick: (ev) => {
						ev.stopPropagation();
						rpc(ide.explore(e.path, true));
					}
				}, el(Icon, {
					name: "locate",
					size: 13
				})), el("button", {
					type: "button",
					className: "dshide-row-btn",
					title: "重命名",
					onClick: (ev) => {
						ev.stopPropagation();
						props.onRename(e.path, e.name);
					}
				}, el(Icon, {
					name: "edit",
					size: 13
				})), el("button", {
					type: "button",
					className: "dshide-row-btn",
					title: "删除",
					onClick: (ev) => {
						ev.stopPropagation();
						props.onDelete(e.path, e.name);
					}
				}, el(Icon, {
					name: "trash",
					size: 13
				}))));
			}));
		}
		function ExplorerView(props) {
			const { ide, rpc, openDoc } = props;
			const el = react.createElement;
			const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [showHidden] = (0, react.useState)(false);
			const [filter, setFilter] = (0, react.useState)("");
			const [action, setAction] = (0, react.useState)(null);
			const [input, setInput] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const seen = {};
			const options = (props.workspaces ?? []).map((w) => ({
				path: w.path,
				title: w.title ?? w.path
			})).filter((o) => {
				if (seen[o.path]) return false;
				seen[o.path] = true;
				return true;
			});
			if (props.root && !seen[props.root]) options.unshift({
				path: props.root,
				title: props.root
			});
			const toggle = (p) => {
				setExpanded((prev) => {
					const n = new Set(prev);
					if (n.has(p)) n.delete(p);
					else n.add(p);
					return n;
				});
			};
			const openFile = (path) => {
				openDoc({
					key: path,
					kind: "file",
					path
				});
			};
			const refresh = () => {
				setExpanded(/* @__PURE__ */ new Set());
			};
			const move = (src, dest) => {
				if (src && src !== dest) rpc(ide.rename(src, joinPath(dest, baseName(src)))).then(refresh);
			};
			const paste = () => {
				setBusy(true);
				rpc(ide.paste(props.root ?? "")).then(() => {
					setBusy(false);
					refresh();
				});
			};
			const startAction = (kind, path, name) => {
				setAction({
					kind,
					path,
					name: name ?? ""
				});
				setInput(name ?? "");
			};
			const cancel = () => {
				setAction(null);
				setInput("");
			};
			const runAction = () => {
				const a = action;
				if (!a) return;
				if (a.kind !== "delete" && input.trim() === "") return;
				setBusy(true);
				const done = () => {
					setBusy(false);
					setAction(null);
					setInput("");
					refresh();
				};
				if (a.kind === "newfile") rpc(ide.newFile(joinPath(a.path, input.trim()))).then(done);
				else if (a.kind === "newdir") rpc(ide.mkdir(joinPath(a.path, input.trim()))).then(done);
				else if (a.kind === "rename") rpc(ide.rename(a.path, joinPath(dirnameOf(a.path), input.trim()))).then(done);
				else if (a.kind === "delete") rpc(ide.delete(a.path)).then(done);
			};
			const actionLabel = action ? action.kind === "newfile" ? "新建文件" : action.kind === "newdir" ? "新建文件夹" : action.kind === "rename" ? "重命名为" : `删除 ${action.name} ?` : "";
			return el("div", { className: "dshide-view" }, el("div", { className: "dshide-toolbar" }, el("select", {
				className: "dshide-select",
				value: props.root ?? "",
				onChange: (e) => {
					props.setRoot(e.target.value);
					refresh();
				}
			}, options.map((o) => el("option", {
				key: o.path,
				value: o.path
			}, o.title))), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "新建文件",
				onClick: () => {
					startAction("newfile", props.root ?? "", "");
				}
			}, el(Icon, {
				name: "file",
				size: 15
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "新建文件夹",
				onClick: () => {
					startAction("newdir", props.root ?? "", "");
				}
			}, el(Icon, {
				name: "folder",
				size: 15
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "粘贴",
				onClick: paste,
				disabled: busy
			}, el(Icon, {
				name: "check",
				size: 15
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "刷新",
				onClick: refresh
			}, el(Icon, {
				name: "refresh",
				size: 15
			}))), el("input", {
				className: "dshide-search-input",
				style: {
					margin: "6px 8px",
					flex: "none"
				},
				placeholder: "按名称查找…",
				value: filter,
				onChange: (e) => {
					setFilter(e.target.value);
				}
			}), action ? el("div", { className: "dshide-actionbar" }, el("span", { className: "dshide-actionbar-label" }, actionLabel), action.kind !== "delete" ? el("input", {
				className: "dshide-actionbar-input",
				autoFocus: true,
				value: input,
				onChange: (e) => {
					setInput(e.target.value);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter") runAction();
					if (e.key === "Escape") cancel();
				}
			}) : null, el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "确认",
				onClick: runAction,
				disabled: busy
			}, el(Icon, {
				name: action.kind === "delete" ? "trash" : "check",
				size: 14
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "取消",
				onClick: cancel
			}, el(Icon, {
				name: "close",
				size: 14
			}))) : null, el("div", { className: "dshide-scroll" }, el(Tree, {
				path: props.root ?? "",
				depth: 0,
				expanded,
				toggle,
				onOpen: openFile,
				showHidden,
				filter,
				onRename: (p, n) => startAction("rename", p, n),
				onDelete: (p, n) => startAction("delete", p, n),
				onMove: move,
				injected: props
			})));
		}
		function SearchView(props) {
			const { ide, rpc, openDoc } = props;
			const el = react.createElement;
			const [query, setQuery] = (0, react.useState)("");
			const [cs, setCs] = (0, react.useState)(false);
			const [loading, setLoading] = (0, react.useState)(false);
			const [result, setResult] = (0, react.useState)(null);
			const run = () => {
				if (!query.trim()) return;
				setLoading(true);
				setResult(null);
				rpc(ide.search(props.root ?? "", query, cs)).then((r) => {
					setResult(r);
					setLoading(false);
				}, (e) => {
					setResult({
						error: String(e.message),
						matches: [],
						files: 0,
						truncated: false
					});
					setLoading(false);
				});
			};
			const openFile = (path) => {
				openDoc({
					key: path,
					kind: "file",
					path
				});
			};
			return el("div", { className: "dshide-view" }, el("div", { className: "dshide-search-box" }, el("input", {
				className: "dshide-search-input",
				placeholder: "在工作区中搜索…",
				value: query,
				onChange: (e) => {
					setQuery(e.target.value);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter") run();
				}
			}), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "区分大小写",
				onClick: () => {
					setCs((v) => !v);
				},
				style: cs ? { color: "var(--dsw-alias-brand-primary)" } : void 0
			}, "Aa"), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "搜索",
				onClick: run
			}, el(Icon, {
				name: "search",
				size: 15
			}))), loading ? el("div", { className: "dshide-loading" }, "搜索中…") : result == null ? el("div", { className: "dshide-empty" }, "输入关键字，在工作区文件中搜索内容。") : result.error ? el("div", { className: "dshide-empty" }, result.error) : el("div", { className: "dshide-results" }, el("div", { className: "dshide-result-summary" }, `${result.matches.length} 处匹配 · ${result.files} 个文件${result.truncated ? "（已截断）" : ""}`), result.matches.length === 0 ? el("div", { className: "dshide-empty" }, "未找到匹配结果。") : result.matches.map((m, i) => el("div", {
				key: i,
				className: "dshide-match",
				onClick: () => {
					openFile(m.path);
				}
			}, el("div", { className: "dshide-match-path" }, m.path), el("div", { className: "dshide-match-line" }, el("span", { className: "dshide-match-lineno" }, String(m.line)), el("span", { className: "dshide-match-text" }, m.text))))));
		}
		function ScmView(props) {
			const { ide, rpc, openDoc } = props;
			const el = react.createElement;
			const [status, setStatus] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const refresh = () => {
				if (!props.root) return;
				setLoading(true);
				rpc(ide.gitStatus(props.root)).then((r) => {
					setStatus(r);
					setLoading(false);
				}, (e) => {
					setStatus({
						branch: "",
						changes: [],
						notRepo: true,
						error: String(e.message)
					});
					setLoading(false);
				});
			};
			(0, react.useEffect)(() => {
				refresh();
			}, [props.root]);
			const act = (fn) => {
				setBusy(true);
				fn().then(() => {
					setBusy(false);
					refresh();
				});
			};
			const openDiff = (path) => {
				openDoc({
					key: `diff:${path}`,
					kind: "diff",
					path,
					...props.root ? { cwd: props.root } : {}
				});
			};
			const commit = () => {
				if (!message.trim()) return;
				setBusy(true);
				rpc(ide.gitCommit(props.root ?? "", message)).then(() => {
					setBusy(false);
					setMessage("");
					refresh();
				});
			};
			const changes = status?.changes ?? [];
			const staged = changes.filter((c) => c.staged && c.staged !== " ");
			const unstaged = changes.filter((c) => !c.staged || c.staged === " ");
			const untracked = changes.filter((c) => c.xy === "??");
			const row = (c, action) => el("div", {
				key: c.path,
				className: "dshide-row",
				onClick: () => {
					openDiff(c.path);
				}
			}, el("span", {
				className: "dshide-scm-status",
				title: c.xy
			}, c.staged || c.unstaged || "?"), el("span", { className: "dshide-name" }, c.path), c.renameFrom ? el("span", { className: "dshide-rename" }, `← ${c.renameFrom}`) : null, el("span", {
				className: "dshide-row-actions",
				onClick: (ev) => {
					ev.stopPropagation();
				}
			}, el("button", {
				type: "button",
				className: "dshide-row-btn",
				title: action === "stage" ? "暂存" : "取消暂存",
				onClick: (ev) => {
					ev.stopPropagation();
					act(() => action === "stage" ? rpc(ide.gitStage(props.root ?? "", [c.path])) : rpc(ide.gitUnstage(props.root ?? "", [c.path])));
				}
			}, el(Icon, {
				name: action === "stage" ? "plus" : "minus",
				size: 13
			})), el("button", {
				type: "button",
				className: "dshide-row-btn",
				title: "丢弃更改",
				onClick: (ev) => {
					ev.stopPropagation();
					act(() => rpc(ide.gitDiscard(props.root ?? "", c.path, c.xy === "??")));
				}
			}, el(Icon, {
				name: "trash",
				size: 13
			}))));
			const group = (label, list, action) => list.length === 0 ? null : el("div", { className: "dshide-scm-group" }, el("div", { className: "dshide-scm-group-title" }, `${label} (${list.length})`), list.map((c) => row(c, action)));
			return el("div", { className: "dshide-view" }, el("div", { className: "dshide-toolbar" }, el("span", { className: "dshide-title" }, "源代码管理"), el("span", {
				className: "dshide-branch",
				title: status?.branch ?? ""
			}, el(Icon, {
				name: "scm",
				size: 14
			}), el("span", null, status?.branch ?? "")), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "暂存全部",
				onClick: () => {
					act(() => rpc(ide.gitStageAll(props.root ?? "")));
				},
				disabled: busy
			}, el(Icon, {
				name: "plus",
				size: 14
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "取消暂存全部",
				onClick: () => {
					act(() => rpc(ide.gitUnstageAll(props.root ?? "")));
				},
				disabled: busy
			}, el(Icon, {
				name: "minus",
				size: 14
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "刷新",
				onClick: refresh,
				disabled: busy
			}, el(Icon, {
				name: "refresh",
				size: 14
			}))), el("div", { className: "dshide-commit" }, el("textarea", {
				className: "dshide-commit-input",
				placeholder: "提交信息（Ctrl+Enter 提交）",
				value: message,
				onChange: (e) => {
					setMessage(e.target.value);
				},
				onKeyDown: (e) => {
					if ((e.ctrlKey || e.metaKey) && e.key === "Enter") commit();
				}
			}), el("button", {
				type: "button",
				className: "dshide-commit-btn",
				disabled: !message.trim() || staged.length === 0 || busy,
				onClick: commit
			}, busy ? "…" : "提交")), loading ? el("div", { className: "dshide-loading" }, "读取中…") : status == null ? null : status.notRepo ? el("div", { className: "dshide-empty" }, "当前工作区不是 Git 仓库。") : status.error ? el("div", { className: "dshide-empty" }, status.error) : el("div", { className: "dshide-scm" }, changes.length === 0 ? el("div", { className: "dshide-empty" }, "没有未提交的更改。") : el("div", null, group("已暂存", staged, "unstage"), group("更改", unstaged, "stage"), group("未跟踪", untracked, "stage"))));
		}
		function SessionView(props) {
			const { sessions, workspaces } = props;
			const el = react.createElement;
			const sessState = props.sessState;
			const wsState = props.wsState;
			const ids = sessState?.ids ?? [];
			const byId = sessState?.byId ?? {};
			const current = sessState?.current;
			const workspaceList = wsState?.items ?? [];
			const archived = new Set(wsState?.archivedSessionIds ?? []);
			const [view, setView] = (0, react.useState)("group");
			const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [query, setQuery] = (0, react.useState)("");
			const [results, setResults] = (0, react.useState)(null);
			const [action, setAction] = (0, react.useState)(null);
			const [input, setInput] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				const q = query.trim();
				if (q === "") {
					setResults(null);
					return;
				}
				let cancelled = false;
				const ctrl = new AbortController();
				const timer = window.setTimeout(() => {
					sessions.search(q, ctrl.signal).then((r) => {
						if (!cancelled) setResults(r);
					}).catch(() => {
						if (!cancelled) setResults({ items: [] });
					});
				}, 250);
				return () => {
					cancelled = true;
					window.clearTimeout(timer);
					try {
						ctrl.abort();
					} catch {}
				};
			}, [query]);
			const q = query.trim().toLowerCase();
			const workspaceBySession = {};
			for (const w of workspaceList) for (const sid of w.sessionIds) if (!workspaceBySession[sid]) workspaceBySession[sid] = w.title;
			const visible = (s) => !!s && s.origin !== "subagent" && !archived.has(s.id) && (!s.blank || s.id === current);
			const label = (s) => workspaceBySession[s.id] || (s.cwd ? s.cwd.replace(/[\\/]+$/, "").split(/[\\/]/).pop() ?? "" : "");
			const clickChatTab = () => {
				try {
					const tabs = document.querySelectorAll("[role=\"tab\"]");
					let first = null;
					for (let i = 0; i < tabs.length; i++) {
						const tab = tabs[i];
						if (!tab) continue;
						const txt = (tab.textContent ?? "").trim();
						if (!first) first = tab;
						if (txt === "对话" || txt === "Chat") {
							tab.click();
							return true;
						}
					}
					if (first) {
						first.click();
						return true;
					}
				} catch {}
				return false;
			};
			const open = (id) => {
				sessions.open(id);
				if (id === current) clickChatTab();
				else [
					150,
					350,
					650,
					1100
				].forEach((d) => {
					window.setTimeout(clickChatTab, d);
				});
			};
			const newSession = () => {
				workspaces.startSession();
			};
			const addWorkspace = () => {
				workspaces.pickDirectory().then((p) => {
					if (p) workspaces.create({ path: p });
				});
			};
			const forkSession = (id) => {
				sessions.fork(id);
			};
			const archiveSession = (id) => {
				sessions.archive(id);
			};
			const runAction = () => {
				const a = action;
				if (!a) return;
				const done = () => {
					setAction(null);
					setInput("");
				};
				if (a.kind === "wrename" && input.trim()) workspaces.rename(a.id, input.trim()).then(done);
				else if (a.kind === "wdelete") workspaces.delete(a.id).then(done);
			};
			const sessionRow = (s, indent) => el("div", {
				key: s.id,
				className: `dshide-row${s.id === current ? " selected" : ""}`,
				style: indent ? { paddingLeft: "18px" } : void 0,
				title: s.displayTitle,
				onClick: () => {
					open(s.id);
				}
			}, el("span", { className: "dshide-dot" }), el("span", { className: "dshide-name" }, s.displayTitle || s.id), el("span", { className: "dshide-time" }, relTime(s.updatedAt)), el("span", {
				className: "dshide-row-actions",
				onClick: (ev) => {
					ev.stopPropagation();
				}
			}, el("button", {
				type: "button",
				className: "dshide-row-btn",
				title: "派生会话",
				onClick: (ev) => {
					ev.stopPropagation();
					forkSession(s.id);
				}
			}, el(Icon, {
				name: "scm",
				size: 13
			})), el("button", {
				type: "button",
				className: "dshide-row-btn",
				title: "归档",
				onClick: (ev) => {
					ev.stopPropagation();
					archiveSession(s.id);
				}
			}, el(Icon, {
				name: "trash",
				size: 13
			}))));
			const workspaceRow = (w) => {
				const members = (w.sessionIds ?? []).map((id) => byId[id]).filter(visible).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
				const isOpen = expanded.has(w.workspaceId);
				return el("div", { key: w.workspaceId }, el("div", {
					className: "dshide-wsgroup-title",
					title: w.path,
					onClick: () => {
						toggleGroup(w.workspaceId);
					}
				}, el("span", { className: `dshide-arrow${isOpen ? " open" : ""}` }, el(Icon, {
					name: "chevron",
					size: 12
				})), el(Icon, {
					name: "folder",
					size: 14,
					className: "dshide-glyph"
				}), el("span", { className: "dshide-name" }, w.title), el("span", {
					className: "dshide-row-actions",
					onClick: (ev) => {
						ev.stopPropagation();
					}
				}, el("button", {
					type: "button",
					className: "dshide-row-btn",
					title: "重命名工作区",
					onClick: (ev) => {
						ev.stopPropagation();
						setAction({
							kind: "wrename",
							id: w.workspaceId,
							name: w.title
						});
						setInput(w.title);
					}
				}, el(Icon, {
					name: "edit",
					size: 13
				})), el("button", {
					type: "button",
					className: "dshide-row-btn",
					title: "删除工作区",
					onClick: (ev) => {
						ev.stopPropagation();
						setAction({
							kind: "wdelete",
							id: w.workspaceId,
							name: w.title
						});
					}
				}, el(Icon, {
					name: "trash",
					size: 13
				})))), isOpen ? members.map((s) => sessionRow(s, true)) : null);
			};
			const toggleGroup = (id) => {
				setExpanded((prev) => {
					const n = new Set(prev);
					if (n.has(id)) n.delete(id);
					else n.add(id);
					return n;
				});
			};
			let body;
			if (q !== "") {
				const local = ids.map((id) => byId[id]).filter(visible).filter((s) => (s.displayTitle ?? "").toLowerCase().includes(q) || label(s).toLowerCase().includes(q)).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
				const content = results?.items ?? [];
				const merged = local.map((s) => ({
					id: s.id,
					title: s.displayTitle ?? s.id,
					ws: label(s)
				}));
				const seenIds = {};
				merged.forEach((m) => {
					seenIds[m.id] = true;
				});
				content.forEach((c) => {
					const ci = c;
					if (!ci.sessionId || seenIds[ci.sessionId]) return;
					const s = byId[ci.sessionId];
					if (s) merged.push({
						id: ci.sessionId,
						title: s.displayTitle ?? ci.sessionId,
						ws: label(s),
						...ci.snippet ? { snippet: ci.snippet } : {}
					});
				});
				const rows = merged.slice(0, 20).map((m) => el("div", {
					key: m.id,
					className: "dshide-row",
					onClick: () => {
						open(m.id);
					}
				}, el("span", { className: "dshide-dot" }), el("span", { className: "dshide-name" }, m.title), m.ws ? el("span", { className: "dshide-rename" }, m.ws) : null, m.snippet ? el("span", { className: "dshide-time" }, m.snippet) : null));
				body = rows.length === 0 ? el("div", { className: "dshide-empty" }, "未找到匹配的会话。") : rows;
			} else if (view === "flat") {
				const flat = ids.map((id) => byId[id]).filter(visible).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
				body = flat.length === 0 ? el("div", { className: "dshide-empty" }, "暂无会话。") : flat.map((s) => sessionRow(s, false));
			} else {
				const accounted = /* @__PURE__ */ new Set();
				const groups = workspaceList.map((w) => {
					w.sessionIds.forEach((id) => {
						accounted.add(id);
					});
					return workspaceRow(w);
				});
				const stray = ids.map((id) => byId[id]).filter(visible).filter((s) => !accounted.has(s.id)).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
				if (stray.length > 0) groups.push(el("div", { key: "__ungrouped" }, el("div", { className: "dshide-wsgroup-title" }, el("span", { className: "dshide-arrow" }, el(Icon, {
					name: "chevron",
					size: 12
				})), el(Icon, {
					name: "folder",
					size: 14,
					className: "dshide-glyph"
				}), el("span", { className: "dshide-name" }, "未分组")), stray.map((s) => sessionRow(s, true))));
				body = groups;
			}
			return el("div", { className: "dshide-view" }, el("div", { className: "dshide-toolbar" }, el("span", { className: "dshide-title" }, "会话管理"), el("div", { className: "dshide-seg" }, el("button", {
				type: "button",
				className: `dshide-seg-btn${view === "group" ? " on" : ""}`,
				onClick: () => {
					setView("group");
				}
			}, "按工作区"), el("button", {
				type: "button",
				className: `dshide-seg-btn${view === "flat" ? " on" : ""}`,
				onClick: () => {
					setView("flat");
				}
			}, "平铺")), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "新建会话",
				onClick: newSession
			}, el(Icon, {
				name: "chat",
				size: 15
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "添加工作区",
				onClick: addWorkspace
			}, el(Icon, {
				name: "plus",
				size: 15
			}))), el("input", {
				className: "dshide-search-input",
				style: {
					margin: "6px 8px",
					flex: "none"
				},
				placeholder: "搜索会话…",
				value: query,
				onChange: (e) => {
					setQuery(e.target.value);
				}
			}), action ? el("div", { className: "dshide-actionbar" }, el("span", { className: "dshide-actionbar-label" }, action.kind === "wrename" ? "重命名工作区" : `删除工作区 ${action.name} ?`), action.kind === "wrename" ? el("input", {
				className: "dshide-actionbar-input",
				autoFocus: true,
				value: input,
				onChange: (e) => {
					setInput(e.target.value);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter") runAction();
					if (e.key === "Escape") setAction(null);
				}
			}) : null, el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "确认",
				onClick: runAction
			}, el(Icon, {
				name: action.kind === "wrename" ? "check" : "trash",
				size: 14
			})), el("button", {
				type: "button",
				className: "dshide-iconbtn",
				title: "取消",
				onClick: () => {
					setAction(null);
					setInput("");
				}
			}, el(Icon, {
				name: "close",
				size: 14
			}))) : null, el("div", { className: "dshide-scroll" }, body));
		}
		//#endregion
		//#region src/client/IdeSidebar.tsx
		/**
		* IDE sidebar: the activity rail plus the active view (Explorer / Search /
		* Source Control / Sessions). Registers into `sidebar.workspaces`; it reads
		* the framework's global `useSessions` / `useWorkspaces` hooks (passed as the
		* root-scope runtime share) and the registrant inject face. Pure presentation.
		* @module @deepseek-ai/dsh-client-ui-ide/client/IdeSidebar
		*/
		function IdeSidebar(props) {
			const el = react.createElement;
			const wsState = props.useWorkspaces ? props.useWorkspaces((s) => s) : null;
			const sessState = props.useSessions ? props.useSessions((s) => s) : null;
			const [active, setActive] = (0, react.useState)("sessions");
			const [root, setRoot] = (0, react.useState)(void 0);
			const items = wsState?.items ?? [];
			const recent = wsState?.recentWorkspaceId;
			(0, react.useEffect)(() => {
				if (root !== void 0) return;
				if (recent) {
					const w = items.find((x) => x.workspaceId === recent);
					if (w?.path) {
						setRoot(w.path);
						return;
					}
				}
				if (items[0]?.path) {
					setRoot(items[0].path);
					return;
				}
				rpc(props.ide.roots()).then((r) => {
					if (r.root) setRoot(r.root);
					else if (r.workspaces[0]) setRoot(r.workspaces[0].path);
				});
			}, [
				root,
				recent,
				items
			]);
			const views = [
				{
					id: "files",
					icon: "explorer",
					label: "资源管理器"
				},
				{
					id: "search",
					icon: "search",
					label: "搜索"
				},
				{
					id: "scm",
					icon: "scm",
					label: "源代码管理"
				},
				{
					id: "sessions",
					icon: "chat",
					label: "会话管理"
				}
			];
			const pick = (v) => {
				if (!props.wide && props.expandSidebar) props.expandSidebar();
				setActive(v);
			};
			const buttons = () => views.map((v) => el("button", {
				key: v.id,
				type: "button",
				title: v.label,
				"aria-label": v.label,
				className: `dshide-activity-btn${props.wide && active === v.id ? " active" : ""}`,
				onClick: () => {
					pick(v.id);
				}
			}, el(Icon, {
				name: v.icon,
				size: 20
			})));
			if (!props.wide) return el("div", { className: "dshide-region rail" }, buttons());
			return el("div", { className: "dshide-region" }, el("div", { className: "dshide-activity" }, buttons()), el("div", { className: "dshide-content" }, active === "sessions" ? el(SessionView, {
				sessions: props.sessions,
				workspaces: props.workspaces,
				wsState,
				sessState
			}) : active === "files" ? el(ExplorerView, {
				ide: props.ide,
				rpc: props.rpc,
				openDoc: props.openDoc,
				root,
				setRoot,
				workspaces: items
			}) : active === "search" ? el(SearchView, {
				ide: props.ide,
				rpc: props.rpc,
				openDoc: props.openDoc,
				sessions: props.sessions,
				workspaces: props.workspaces,
				root
			}) : el(ScmView, {
				ide: props.ide,
				rpc: props.rpc,
				openDoc: props.openDoc,
				sessions: props.sessions,
				workspaces: props.workspaces,
				root
			})));
		}
		//#endregion
		//#region src/client/EditorView.tsx
		/**
		* Editor column: the open file/diff tab strip plus the active viewer. Reads
		* the shared editor store (passed via the inject face) and the `ide` Remote.
		* Registers into `editor` (ui-layout #6) or, as a fallback, a
		* `conversation.view` tab. Pure presentation.
		* @module @deepseek-ai/dsh-client-ui-ide/client/EditorView
		*/
		function FileEditor(props) {
			const { ide, rpc: call } = props.injected;
			const el = react.createElement;
			const [st, setSt] = (0, react.useState)({ loading: true });
			(0, react.useEffect)(() => {
				let cancelled = false;
				setSt({ loading: true });
				call(ide.readText(props.path)).then((r) => {
					if (!cancelled) setSt({
						content: r.content,
						error: "",
						truncated: r.truncated,
						loading: false
					});
				}, (e) => {
					if (!cancelled) setSt({
						error: String(e.message),
						loading: false
					});
				});
				return () => {
					cancelled = true;
				};
			}, [props.path]);
			if (st.loading) return el("div", { className: "dshide-loading" }, "加载中…");
			if (st.error) return el("div", { className: "dshide-empty" }, st.error);
			const lang = detectLang(props.path);
			const lines = (st.content ?? "").split(/\r?\n/);
			return el("div", { className: "dshide-editor-body" }, el("div", {
				className: "dshide-preview-path",
				title: props.path
			}, props.path), el("pre", { className: "dshide-code" }, lines.map((ln, i) => el("div", {
				key: i,
				className: "dshide-codeline"
			}, el("span", { className: "dshide-lineno" }, String(i + 1)), renderLine(ln, lang))), st.truncated ? el("div", { className: "dshide-empty" }, "… 文件过大，已截断") : null));
		}
		function DiffEditor(props) {
			const { ide, rpc: call } = props.injected;
			const el = react.createElement;
			const [st, setSt] = (0, react.useState)({ loading: true });
			(0, react.useEffect)(() => {
				let cancelled = false;
				setSt({ loading: true });
				call(ide.gitDiff(props.cwd, props.path)).then((r) => {
					if (!cancelled) setSt({
						stdout: r.stdout,
						stderr: r.stderr,
						loading: false
					});
				}, (e) => {
					if (!cancelled) setSt({
						stderr: String(e.message),
						loading: false
					});
				});
				return () => {
					cancelled = true;
				};
			}, [props.cwd, props.path]);
			if (st.loading) return el("div", { className: "dshide-loading" }, "加载中…");
			if (st.stderr && !st.stdout) return el("div", { className: "dshide-empty" }, st.stderr);
			const lines = (st.stdout ?? "").split(/\r?\n/);
			return el("div", { className: "dshide-editor-body" }, el("div", {
				className: "dshide-preview-path",
				title: props.path
			}, props.path), el("pre", { className: "dshide-code" }, lines.map((ln, i) => {
				const cls = ln.startsWith("+") && !ln.startsWith("+++") ? "dshide-diff-line add" : ln.startsWith("-") && !ln.startsWith("---") ? "dshide-diff-line del" : ln.startsWith("@@") ? "dshide-diff-line hunk" : "dshide-diff-line";
				return el("div", {
					key: i,
					className: cls
				}, ln || " ");
			})));
		}
		function EditorView(props) {
			const el = react.createElement;
			const store = props.store;
			const [state, setState] = (0, react.useState)({
				tabs: store.tabs,
				activeId: store.activeId
			});
			(0, react.useEffect)(() => store.subscribe(() => {
				setState({
					tabs: store.tabs,
					activeId: store.activeId
				});
			}), []);
			const tabs = state.tabs;
			const activeId = state.activeId;
			const active = tabs.find((t) => t.key === activeId) ?? null;
			return el("div", { className: "dshide-editor" }, el("div", { className: "dshide-etabs" }, tabs.map((t) => el("div", {
				key: t.key,
				className: `dshide-etab${t.key === activeId ? " active" : ""}`,
				title: t.path,
				onClick: () => {
					store.setActive(t.key);
				}
			}, el("span", { className: "dshide-etab-label" }, baseName(t.path) + (t.kind === "diff" ? " ⇄" : "")), el("button", {
				type: "button",
				className: "dshide-etab-close",
				title: "关闭",
				onClick: (e) => {
					e.stopPropagation();
					store.close(t.key);
				}
			}, el(Icon, {
				name: "close",
				size: 11
			})))), tabs.length === 0 ? el("span", { className: "dshide-etab-hint" }, "从侧栏打开文件或 diff") : null), active === null ? el("div", { className: "dshide-editor-empty" }, "在资源管理器 / 搜索 / 源码管理中打开文档") : active.kind === "file" ? el(FileEditor, {
				path: active.path,
				injected: props
			}) : el(DiffEditor, {
				cwd: active.cwd ?? "",
				path: active.path,
				injected: props
			}));
		}
		//#endregion
		//#region \0dshide:D:\working\projects\deepseek-harness-UI\packages\client-ui-ide\src\client\styles.module.css.mjs
		const css = "﻿\r\n.dshide-region{height:100%;width:100%;display:flex;flex-direction:row;overflow:hidden;color:var(--dsw-alias-label-primary);font-size:14px;}.dshide-region *{box-sizing:border-box;}.dshide-activity{flex:none;width:44px;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0;border-right:1px solid var(--dsw-alias-border-l1);}.dshide-activity-btn{position:relative;width:44px;height:40px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0;border-radius:8px;}.dshide-activity-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-activity-btn.active::before{content:\"\";position:absolute;left:-2px;top:9px;bottom:9px;width:2px;border-radius:0 2px 2px 0;background:var(--dsw-alias-brand-primary);}.dshide-content{flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-region.rail{flex-direction:column;align-items:center;gap:2px;padding:6px 0;}.dshide-region.rail .dshide-activity-btn{width:36px;height:36px;}.dshide-view{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-toolbar{flex:none;display:flex;align-items:center;gap:4px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.dshide-select{flex:1;min-width:0;height:28px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 6px;}.dshide-iconbtn{width:28px;height:28px;flex:none;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:6px;padding:0;font-size:13px;}.dshide-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}.dshide-seg{flex:none;display:flex;align-items:center;background:var(--dsw-alias-bg-layer-2,transparent);border-radius:6px;padding:1px;}.dshide-seg-btn{height:24px;padding:0 10px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;border-radius:5px;}.dshide-seg-btn.on{background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.1);}.dshide-scroll{flex:1;min-height:0;overflow:auto;}.dshide-row{display:flex;align-items:center;gap:6px;height:32px;flex:none;padding:0 8px;cursor:pointer;user-select:none;white-space:nowrap;color:var(--dsw-alias-label-primary);}.dshide-row:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-row.selected{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-arrow{width:14px;flex:none;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-secondary);transition:transform .12s ease;}.dshide-arrow.open{transform:rotate(90deg);}.dshide-glyph{flex:none;color:var(--dsw-alias-label-secondary);}.dshide-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;font-size:14px;line-height:20px;}.dshide-time{flex:none;color:var(--dsw-alias-label-secondary);font-size:12px;}.dshide-dot{flex:none;border-radius:50%;display:inline-block;}.dshide-dot-done{background:var(--dsw-alias-state-success-primary);}.dshide-dot-warning{background:var(--dsw-alias-state-warn-primary);}.dshide-dot-error{background:var(--dsw-alias-state-error-primary);}.dshide-dot-idle{background:var(--dsw-alias-label-secondary);opacity:.35;}.dshide-dot-matrix{flex:none;display:block;}.dshide-dot-cell{fill:var(--dsw-alias-brand-primary);animation:dshide-blink 1s linear infinite;}@keyframes dshide-blink{0%,100%{opacity:.2}50%{opacity:1}}.dshide-wsgroup-title{display:flex;align-items:center;gap:6px;height:34px;flex:none;padding:0 8px;cursor:pointer;user-select:none;font-weight:600;font-size:13px;color:var(--dsw-alias-label-primary);}.dshide-wsgroup-title:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-loading{padding:16px;color:var(--dsw-alias-label-secondary);font-size:14px;}.dshide-empty{padding:16px 14px;color:var(--dsw-alias-label-secondary);font-size:14px;line-height:20px;}.dshide-preview-path{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Consolas,monospace;font-size:12px;color:var(--dsw-alias-label-secondary);}.dshide-code{flex:1;min-height:0;overflow:auto;margin:0;padding:8px 0;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:20px;}.dshide-codeline{display:flex;}.dshide-lineno{flex:none;width:44px;text-align:right;padding-right:12px;color:var(--dsw-alias-label-secondary);user-select:none;opacity:.6;}.dshide-linetext{white-space:pre;}.tok-kw{color:var(--dsw-alias-brand-primary);}.tok-str{color:var(--dsw-alias-state-success-primary);}.tok-com{color:var(--dsw-alias-label-secondary);font-style:italic;opacity:.7;}.tok-num{color:var(--dsw-alias-state-warn-primary);}.tok-bool{color:var(--dsw-alias-brand-primary);}.tok-tag{color:var(--dsw-alias-brand-primary);}.tok-attr{color:var(--dsw-alias-state-warn-primary);}.tok-prop{color:var(--dsw-alias-label-primary);}.tok-json-key{color:var(--dsw-alias-brand-primary);}.tok-md-heading{color:var(--dsw-alias-label-primary);font-weight:700;}.tok-bold{font-weight:700;}.tok-link{color:var(--dsw-alias-brand-primary);text-decoration:underline;}.dshide-row-actions{flex:none;display:none;align-items:center;gap:2px;}.dshide-row:hover .dshide-row-actions,.dshide-wsgroup-title:hover .dshide-row-actions{display:flex;}.dshide-row-btn{flex:none;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:4px;padding:0;}.dshide-row-btn:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-primary);}.dshide-actionbar{flex:none;display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-actionbar-label{flex:none;font-size:14px;color:var(--dsw-alias-label-secondary);}.dshide-actionbar-input{flex:1;min-width:0;height:28px;border:1px solid var(--dsw-alias-brand-primary);border-radius:6px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 8px;outline:none;}.dshide-search-box{flex:none;display:flex;align-items:center;gap:4px;padding:8px;}.dshide-search-input{flex:1;min-width:0;height:32px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:0 10px;outline:none;}.dshide-search-input:focus{border-color:var(--dsw-alias-brand-primary);}.dshide-results{flex:1;min-height:0;overflow:auto;}.dshide-result-summary{padding:8px 12px;font-size:13px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match{padding:6px 12px;cursor:pointer;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-match:hover{background:var(--dsw-alias-interactive-bg-hover,var(--dsw-alias-bg-layer-2));}.dshide-match-path{font-size:13px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px;}.dshide-match-line{display:flex;gap:8px;font-family:ui-monospace,Consolas,monospace;font-size:12px;}.dshide-match-lineno{flex:none;color:var(--dsw-alias-brand-primary);min-width:20px;text-align:right;}.dshide-match-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--dsw-alias-label-secondary);}.dshide-scm{flex:1;min-height:0;overflow:auto;}.dshide-scm-group-title{padding:10px 12px 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--dsw-alias-label-secondary);}.dshide-scm-status{flex:none;width:14px;text-align:center;font-family:ui-monospace,monospace;font-weight:700;font-size:13px;color:var(--dsw-alias-state-warn-primary);}.dshide-branch{flex:1;min-width:0;display:flex;align-items:center;gap:6px;font-size:14px;color:var(--dsw-alias-label-primary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;padding:0 4px;}.dshide-rename{color:var(--dsw-alias-label-secondary);font-size:12px;}.dshide-diff-line{white-space:pre;padding-left:8px;}.dshide-diff-line.add{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent);color:var(--dsw-alias-state-success-primary);}.dshide-diff-line.del{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);}.dshide-diff-line.hunk{color:var(--dsw-alias-brand-primary);}.dshide-commit{flex:none;display:flex;gap:6px;padding:8px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-commit-input{flex:1;min-width:0;height:56px;resize:none;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1,transparent);color:var(--dsw-alias-label-primary);font-size:14px;padding:8px;font-family:inherit;outline:none;}.dshide-commit-input:focus{border-color:var(--dsw-alias-brand-primary);}.dshide-commit-btn{flex:none;align-self:flex-start;height:28px;padding:0 12px;border:0;border-radius:6px;background:var(--dsw-alias-brand-primary);color:#fff;font-size:14px;cursor:pointer;}.dshide-commit-btn:disabled{opacity:.4;cursor:default;}.dshide-editor{flex:1;min-height:0;height:100%;display:flex;flex-direction:column;overflow:hidden;width:100%;}.dshide-etabs{flex:none;display:flex;align-items:stretch;gap:2px;padding:6px 8px 0;border-bottom:1px solid var(--dsw-alias-border-l1);overflow-x:auto;background:var(--dsw-alias-bg-base);}.dshide-etab{flex:none;display:flex;align-items:center;gap:6px;max-width:200px;height:28px;padding:0 6px 0 10px;border:1px solid transparent;border-bottom:none;border-radius:6px 6px 0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;line-height:26px;}.dshide-etab:hover{background:var(--dsw-alias-interactive-bg-hover);}.dshide-etab.active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l1);}.dshide-etab-label{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}.dshide-etab-close{width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center;border:0;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;border-radius:4px;padding:0;}.dshide-etab-close:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover);}.dshide-etab-hint{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:28px;padding-left:4px;}.dshide-editor-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:13px;}.dshide-editor-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}.dshide-editor-body .dshide-preview-path{flex:none;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);}.dshide-editor-body .dshide-code{flex:1;min-height:0;overflow:auto;}\r\n";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"@deepseek-ai/dsh-client-ui-ide/styles\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.pluginCss = "@deepseek-ai/dsh-client-ui-ide/styles";
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/index.ts
		/** Required services (cordis fiber inject). */
		const inject = [
			"slots",
			"remote",
			"sessions",
			"workspaces"
		];
		/** Activate the conversation editor view: click the 编辑器 tab by label. */
		function clickTabNow(labels) {
			try {
				const tabs = document.querySelectorAll("[role=\"tab\"]");
				for (let i = 0; i < tabs.length; i++) {
					const tab = tabs[i];
					if (!tab) continue;
					const txt = (tab.textContent ?? "").trim();
					for (const l of labels) if (txt === l) {
						tab.click();
						return true;
					}
				}
			} catch {}
			return false;
		}
		/**
		* Mount the ide Remote and register the sidebar + editor surfaces.
		* @param ctx - client root context.
		*/
		async function apply(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			ctx.effect(() => () => {
				disposeRemote();
			});
			const ide = ctx.remote.ide;
			const store = createIdeStore();
			const injected = {
				ide,
				rpc,
				store,
				openDoc: (tab) => {
					store.add(tab);
					clickTabNow(["编辑器", "Editor"]);
				},
				sessions: {
					open: (id) => {
						ctx.sessions.open(id);
					},
					search: async (query, signal) => {
						const result = await ctx.sessions.search(query, signal);
						if (!result.ok) throw new Error(result.error.message);
						return result.value;
					},
					fork: (id) => {
						ctx.sessions.fork({
							sessionId: id,
							increaseTitle: true
						}).then((childId) => {
							ctx.sessions.open(childId);
						}).catch(() => {});
					},
					archive: (id) => {
						ctx.workspaces.archiveSession(id);
					}
				},
				workspaces: {
					startSession: () => {
						ctx.workspaces.startSession();
					},
					pickDirectory: () => ctx.workspaces.pickDirectory(),
					create: (input) => ctx.workspaces.create(input),
					rename: (id, title) => ctx.workspaces.rename(id, title),
					delete: (id) => ctx.workspaces.delete(id)
				}
			};
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				inject: () => injected
			}, IdeSidebar));
			ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "editor",
				order: 20,
				label: "编辑器",
				inject: () => injected
			}, EditorView));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
