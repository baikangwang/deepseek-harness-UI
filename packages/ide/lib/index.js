import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region src/settings-shared.ts
/** Directory names the content search skips by default (keep in sync with the Host search fallback). */
const IDE_DEFAULT_EXCLUDES = [
	"node_modules",
	".git",
	"dist",
	"build",
	"out",
	"target",
	"coverage",
	".next",
	".dsh",
	".agent-presets",
	"__pycache__",
	".venv",
	"venv",
	".idea",
	".vscode"
];
/** Defaults when the settings service is absent or the section is empty. */
const DEFAULT_IDE_SETTINGS = {
	search: {
		excludes: [...IDE_DEFAULT_EXCLUDES],
		maxFiles: 400,
		maxMatches: 200
	},
	editor: {
		fontSize: 13,
		showLineNumbers: true
	},
	explorer: { abbreviateHome: true },
	git: { autoRefreshMs: 3e4 }
};
/** Normalize a possibly-partial resolved section onto the defaults. */
function normalizeIdeSettings(value) {
	const v = value ?? {};
	const search = v.search ?? {};
	const editor = v.editor ?? {};
	const explorer = v.explorer ?? {};
	const git = v.git ?? {};
	return {
		search: {
			excludes: Array.isArray(search.excludes) && search.excludes.length > 0 ? [...search.excludes] : [...IDE_DEFAULT_EXCLUDES],
			maxFiles: typeof search.maxFiles === "number" && search.maxFiles > 0 ? search.maxFiles : DEFAULT_IDE_SETTINGS.search.maxFiles,
			maxMatches: typeof search.maxMatches === "number" && search.maxMatches > 0 ? search.maxMatches : DEFAULT_IDE_SETTINGS.search.maxMatches
		},
		editor: {
			fontSize: typeof editor.fontSize === "number" && editor.fontSize >= 8 && editor.fontSize <= 32 ? editor.fontSize : DEFAULT_IDE_SETTINGS.editor.fontSize,
			showLineNumbers: typeof editor.showLineNumbers === "boolean" ? editor.showLineNumbers : DEFAULT_IDE_SETTINGS.editor.showLineNumbers
		},
		explorer: { abbreviateHome: typeof explorer.abbreviateHome === "boolean" ? explorer.abbreviateHome : DEFAULT_IDE_SETTINGS.explorer.abbreviateHome },
		git: { autoRefreshMs: typeof git.autoRefreshMs === "number" && git.autoRefreshMs >= 0 ? git.autoRefreshMs : DEFAULT_IDE_SETTINGS.git.autoRefreshMs }
	};
}
//#endregion
//#region src/settings.ts
/**
* Host-side settings registration for the `ide` namespace. Composed as part of
* the single dsh-ide-ui row: `IdeService` probes the optional `settings`
* service at construction and registers here when a provider is composed.
* Absent a settings provider (a minimal deployment), registration is skipped
* and every consumer falls back to {@link DEFAULT_IDE_SETTINGS}.
*
* rc.8: the third-party namespace allowlist was removed ("registering is
* exposing"), so the browser settings page serves this namespace and the
* plugin's own card (registered under the `settings.plugin.item` keyed slot)
* without any host-side changes.
* @module dsh-ide-ui/settings
*/
/** Branded settings namespace for the `ide` section. */
const IDE_SETTINGS_NAMESPACE = settingsNamespace("ide");
/** Durable `ide` section schema; also the wire envelope the browser scope validates against. */
const IdeSettingsSchema = z.object({
	search: z.object({
		excludes: z.array(z.string()).default([...IDE_DEFAULT_EXCLUDES]),
		maxFiles: z.number().default(400),
		maxMatches: z.number().default(200)
	}),
	editor: z.object({
		fontSize: z.number().default(13),
		showLineNumbers: z.boolean().default(true)
	}),
	explorer: z.object({ abbreviateHome: z.boolean().default(true) }),
	git: z.object({ autoRefreshMs: z.number().default(3e4) })
});
/**
* Register the `ide` namespace when a settings provider is already composed.
* Non-blocking by design: this probes `ctx.get('settings')` instead of
* declaring a hard inject, so a deployment without the settings service still
* activates the plugin (consumers use the defaults).
* @param ctx - the plugin context (service construction context).
* @returns whether the namespace was registered.
*/
function registerIdeSettings(ctx) {
	const settings = ctx.get("settings");
	if (settings === void 0) return false;
	settings.register(IDE_SETTINGS_NAMESPACE, IdeSettingsSchema, { applies: "live" });
	return true;
}
//#endregion
//#region src/index.ts
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Remote-only service exposing the DSH Code file / git / search surface. */
let IdeService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _roots_decorators;
	let _listDir_decorators;
	let _readText_decorators;
	let _newFile_decorators;
	let _mkdir_decorators;
	let _delete_decorators;
	let _rename_decorators;
	let _explore_decorators;
	let _paste_decorators;
	let _gitStatus_decorators;
	let _gitStatusMap_decorators;
	let _gitDiff_decorators;
	let _gitStage_decorators;
	let _gitUnstage_decorators;
	let _gitStageAll_decorators;
	let _gitUnstageAll_decorators;
	let _gitDiscard_decorators;
	let _gitCommit_decorators;
	let _search_decorators;
	return class IdeService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_roots_decorators = [Remote("roots")];
			_listDir_decorators = [Remote("listDir")];
			_readText_decorators = [Remote("readText")];
			_newFile_decorators = [Remote("newFile")];
			_mkdir_decorators = [Remote("mkdir")];
			_delete_decorators = [Remote("delete")];
			_rename_decorators = [Remote("rename")];
			_explore_decorators = [Remote("explore")];
			_paste_decorators = [Remote("paste")];
			_gitStatus_decorators = [Remote("gitStatus")];
			_gitStatusMap_decorators = [Remote("gitStatusMap")];
			_gitDiff_decorators = [Remote("gitDiff")];
			_gitStage_decorators = [Remote("gitStage")];
			_gitUnstage_decorators = [Remote("gitUnstage")];
			_gitStageAll_decorators = [Remote("gitStageAll")];
			_gitUnstageAll_decorators = [Remote("gitUnstageAll")];
			_gitDiscard_decorators = [Remote("gitDiscard")];
			_gitCommit_decorators = [Remote("gitCommit")];
			_search_decorators = [Remote("search")];
			__esDecorate(this, null, _roots_decorators, {
				kind: "method",
				name: "roots",
				static: false,
				private: false,
				access: {
					has: (obj) => "roots" in obj,
					get: (obj) => obj.roots
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listDir_decorators, {
				kind: "method",
				name: "listDir",
				static: false,
				private: false,
				access: {
					has: (obj) => "listDir" in obj,
					get: (obj) => obj.listDir
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _readText_decorators, {
				kind: "method",
				name: "readText",
				static: false,
				private: false,
				access: {
					has: (obj) => "readText" in obj,
					get: (obj) => obj.readText
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _newFile_decorators, {
				kind: "method",
				name: "newFile",
				static: false,
				private: false,
				access: {
					has: (obj) => "newFile" in obj,
					get: (obj) => obj.newFile
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _mkdir_decorators, {
				kind: "method",
				name: "mkdir",
				static: false,
				private: false,
				access: {
					has: (obj) => "mkdir" in obj,
					get: (obj) => obj.mkdir
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _delete_decorators, {
				kind: "method",
				name: "delete",
				static: false,
				private: false,
				access: {
					has: (obj) => "delete" in obj,
					get: (obj) => obj.delete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rename_decorators, {
				kind: "method",
				name: "rename",
				static: false,
				private: false,
				access: {
					has: (obj) => "rename" in obj,
					get: (obj) => obj.rename
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _explore_decorators, {
				kind: "method",
				name: "explore",
				static: false,
				private: false,
				access: {
					has: (obj) => "explore" in obj,
					get: (obj) => obj.explore
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _paste_decorators, {
				kind: "method",
				name: "paste",
				static: false,
				private: false,
				access: {
					has: (obj) => "paste" in obj,
					get: (obj) => obj.paste
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitStatus_decorators, {
				kind: "method",
				name: "gitStatus",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitStatus" in obj,
					get: (obj) => obj.gitStatus
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitStatusMap_decorators, {
				kind: "method",
				name: "gitStatusMap",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitStatusMap" in obj,
					get: (obj) => obj.gitStatusMap
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitDiff_decorators, {
				kind: "method",
				name: "gitDiff",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitDiff" in obj,
					get: (obj) => obj.gitDiff
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitStage_decorators, {
				kind: "method",
				name: "gitStage",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitStage" in obj,
					get: (obj) => obj.gitStage
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitUnstage_decorators, {
				kind: "method",
				name: "gitUnstage",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitUnstage" in obj,
					get: (obj) => obj.gitUnstage
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitStageAll_decorators, {
				kind: "method",
				name: "gitStageAll",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitStageAll" in obj,
					get: (obj) => obj.gitStageAll
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitUnstageAll_decorators, {
				kind: "method",
				name: "gitUnstageAll",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitUnstageAll" in obj,
					get: (obj) => obj.gitUnstageAll
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitDiscard_decorators, {
				kind: "method",
				name: "gitDiscard",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitDiscard" in obj,
					get: (obj) => obj.gitDiscard
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _gitCommit_decorators, {
				kind: "method",
				name: "gitCommit",
				static: false,
				private: false,
				access: {
					has: (obj) => "gitCommit" in obj,
					get: (obj) => obj.gitCommit
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _search_decorators, {
				kind: "method",
				name: "search",
				static: false,
				private: false,
				access: {
					has: (obj) => "search" in obj,
					get: (obj) => obj.search
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"fs",
			"subprocess",
			"workspaceRegistry",
			"sandboxPolicy"
		];
		constructor(ctx) {
			super(ctx, "ide");
			__runInitializers(this, _instanceExtraInitializers);
			registerIdeSettings(ctx);
		}
		/** Resolved `ide` settings (defaults when the settings service is absent). */
		ideSettings() {
			const settings = this.ctx.get("settings");
			if (settings === void 0) return DEFAULT_IDE_SETTINGS;
			return normalizeIdeSettings(settings.get(IDE_SETTINGS_NAMESPACE));
		}
		str(v) {
			return v == null ? "" : String(v);
		}
		root() {
			const policy = this.ctx.sandboxPolicy;
			return policy !== void 0 && policy.workspaceRoot ? this.str(policy.workspaceRoot) : "";
		}
		/** Run one executable with explicit argv (no shell concatenation). */
		async run(exe, cwd, args, maxBytes) {
			const subprocess = this.ctx.subprocess;
			if (subprocess === void 0) return {
				ok: false,
				exitCode: null,
				stdout: "",
				stderr: "subprocess service unavailable",
				spawnFailed: true
			};
			try {
				const bin = await subprocess.resolveExecutable(exe);
				const handle = subprocess.spawn({
					argv: [bin, ...args.map(this.str)],
					cwd: cwd || this.root() || ".",
					stdio: {
						stdin: "ignore",
						stdout: {
							maxBytes: maxBytes ?? 2097152,
							spill: { maxBytes: 8388608 }
						},
						stderr: { maxBytes: 131072 }
					},
					graceMs: 3e3
				});
				const outcome = await handle.done;
				const stdout = handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : "";
				const stderr = handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : "";
				return {
					ok: outcome.exitCode === 0,
					exitCode: outcome.exitCode,
					stdout,
					stderr,
					spawnFailed: false
				};
			} catch (error) {
				return {
					ok: false,
					exitCode: null,
					stdout: "",
					stderr: error instanceof Error ? error.message : String(error),
					spawnFailed: true
				};
			}
		}
		git(cwd, args) {
			return this.run("git", cwd, args);
		}
		pwsh(script, args) {
			return this.run("pwsh", this.root(), [
				"-NoProfile",
				"-NonInteractive",
				"-Command",
				script,
				...args
			]);
		}
		async roots() {
			const workspaces = [];
			const registry = this.ctx.workspaceRegistry;
			if (registry !== void 0) try {
				for (const w of registry.list()) workspaces.push({
					id: this.str(w.id),
					title: this.str(w.title),
					path: this.str(w.path)
				});
			} catch {}
			const policy = this.ctx.sandboxPolicy;
			return {
				root: policy !== void 0 ? this.str(policy.workspaceRoot) : "",
				workspaces
			};
		}
		async listDir(path) {
			const fs = this.ctx.fs;
			if (fs === void 0) throw new Error("filesystem service unavailable");
			const target = await fs.resolve(path);
			const rows = (await fs.listDir(target)).filter((e) => e.type === "directory" || e.type === "file").map((e) => ({
				name: e.name,
				type: e.type,
				path: this.str(e.target && e.target.displayPath),
				size: typeof e.size === "number" ? e.size : null
			}));
			rows.sort((a, b) => {
				const ad = a.type === "directory" ? 0 : 1;
				const bd = b.type === "directory" ? 0 : 1;
				if (ad !== bd) return ad - bd;
				return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
			});
			return {
				path: this.str(target.displayPath),
				entries: rows
			};
		}
		async readText(path) {
			const fs = this.ctx.fs;
			if (fs === void 0) throw new Error("filesystem service unavailable");
			const cap = 409600;
			const target = await fs.resolve(path);
			const info = await fs.stat(target);
			if (info !== void 0 && info.type !== "file") throw new Error("not a regular file");
			const text = await fs.readText(target);
			const truncated = text.length > cap;
			return {
				path: this.str(target.displayPath),
				content: truncated ? text.slice(0, cap) : text,
				truncated,
				size: text.length
			};
		}
		async newFile(path) {
			const fs = this.ctx.fs;
			if (fs === void 0) throw new Error("filesystem service unavailable");
			const target = await fs.resolve(path);
			await fs.writeText(target, "", { kind: "createIfAbsent" });
			return {
				ok: true,
				path: this.str(target.displayPath)
			};
		}
		async mkdir(path) {
			const d = await this.pwsh("New-Item -ItemType Directory -Force -Path $args[0] | Out-Null", [path]);
			return {
				ok: d.ok,
				stderr: d.stderr,
				path
			};
		}
		async delete(path) {
			const d = await this.pwsh("Remove-Item -LiteralPath $args[0] -Recurse -Force", [path]);
			return {
				ok: d.ok,
				stderr: d.stderr,
				path
			};
		}
		async rename(from, to) {
			const d = await this.pwsh("Move-Item -LiteralPath $args[0] -Destination $args[1] -Force", [from, to]);
			return {
				ok: d.ok,
				stderr: d.stderr,
				from,
				to
			};
		}
		async explore(path, select) {
			const argv = select ? [`/select,${path}`] : [path];
			return {
				ok: !(await this.run("explorer.exe", this.root(), argv)).spawnFailed,
				path
			};
		}
		async paste(dest) {
			const d = await this.pwsh("$files=@(Get-Clipboard -Format FileDropList);$out=@();foreach($f in $files){Copy-Item -LiteralPath $f -Destination $args[0] -Recurse -Force;$out+=(Split-Path $f -Leaf)};$out -join [char]10", [dest]);
			return {
				ok: d.ok,
				files: d.stdout.split("\n").filter(Boolean),
				stderr: d.stderr
			};
		}
		async gitStatus(cwd) {
			if (cwd === "") return {
				branch: "",
				changes: [],
				notRepo: true,
				error: "no workspace directory"
			};
			const branch = await this.git(cwd, [
				"rev-parse",
				"--abbrev-ref",
				"HEAD"
			]);
			const st = await this.git(cwd, [
				"status",
				"--porcelain=v1",
				"-z",
				"--untracked-files=all"
			]);
			if (!branch.ok) return {
				branch: "",
				changes: [],
				notRepo: true,
				error: (branch.stderr || "").trim() || "not a git repository"
			};
			if (!st.ok) return {
				branch: branch.stdout.trim(),
				changes: [],
				notRepo: false,
				error: (st.stderr || "").trim()
			};
			return {
				branch: branch.stdout.trim(),
				changes: this.parseStatus(st.stdout),
				notRepo: false,
				error: ""
			};
		}
		async gitStatusMap(cwd) {
			if (cwd === "") return {
				branch: "",
				files: {},
				ignoredDirs: [],
				notRepo: true,
				error: "no workspace directory"
			};
			const branch = await this.git(cwd, [
				"rev-parse",
				"--abbrev-ref",
				"HEAD"
			]);
			if (!branch.ok) return {
				branch: "",
				files: {},
				ignoredDirs: [],
				notRepo: true,
				error: (branch.stderr || "").trim() || "not a git repository"
			};
			const st = await this.git(cwd, [
				"status",
				"--porcelain=v1",
				"-z",
				"--untracked-files=all"
			]);
			const ig = await this.git(cwd, [
				"-c",
				"core.quotepath=false",
				"status",
				"--porcelain=v1",
				"--ignored"
			]);
			const files = {};
			if (st.ok) for (const c of this.parseStatus(st.stdout)) files[c.path] = this.condense(c);
			const ignoredDirs = this.parseIgnored(ig.ok ? ig.stdout : "");
			return {
				branch: branch.stdout.trim(),
				files,
				ignoredDirs,
				notRepo: false,
				error: ""
			};
		}
		/** Condense a porcelain change record into the explorer decoration state. */
		condense(c) {
			const [x, y] = [c.staged, c.unstaged];
			if (c.xy.includes("U") || c.xy === "AA" || c.xy === "DD") return {
				code: "C",
				staged: false
			};
			if (c.xy === "??") return {
				code: "U",
				staged: false
			};
			if (x && x !== " ") return {
				code: x,
				staged: true
			};
			if (y && y !== " ") return {
				code: y,
				staged: false
			};
			return {
				code: "M",
				staged: false
			};
		}
		/** Parse `git status --porcelain=v1 --ignored` (directory-aggregated, capped). */
		parseIgnored(stdout) {
			const out = [];
			const MAX = 3e3;
			for (const line of stdout.split(/\r?\n/)) {
				if (out.length >= MAX) break;
				const t = line.trim();
				if (!t.startsWith("!! ")) continue;
				let p = t.slice(3).trim();
				if (p === "") continue;
				if (p.endsWith("/")) p = p.slice(0, -1);
				out.push(p);
			}
			return out;
		}
		parseStatus(stdout) {
			const out = [];
			const parts = stdout.split("\0");
			let i = 0;
			while (i < parts.length) {
				const rec = parts[i];
				i++;
				if (rec == null || rec === "" || rec.length < 4) continue;
				const xy = rec.slice(0, 2);
				const path = rec.slice(3);
				const staged = xy[0] === " " ? "" : xy[0] ?? "";
				const unstaged = xy[1] === " " ? "" : xy[1] ?? "";
				if (xy[0] === "R" || xy[0] === "C") {
					const from = i < parts.length ? parts[i] ?? "" : "";
					if (i < parts.length) i++;
					out.push({
						xy,
						path,
						renameFrom: from,
						staged,
						unstaged
					});
				} else out.push({
					xy,
					path,
					renameFrom: "",
					staged,
					unstaged
				});
			}
			return out;
		}
		async gitDiff(cwd, path) {
			const argv = path ? [
				"diff",
				"HEAD",
				"--",
				path
			] : [
				"diff",
				"HEAD",
				"--stat"
			];
			const d = await this.git(cwd, argv);
			return {
				stdout: d.stdout,
				ok: d.ok,
				stderr: d.stderr,
				path: path ?? ""
			};
		}
		async gitStage(cwd, paths) {
			if (paths.length === 0) return {
				ok: false,
				stderr: "no paths"
			};
			const d = await this.git(cwd, [
				"add",
				"--",
				...paths
			]);
			return {
				ok: d.ok,
				stderr: d.stderr
			};
		}
		async gitUnstage(cwd, paths) {
			if (paths.length === 0) return {
				ok: false,
				stderr: "no paths"
			};
			const d = await this.git(cwd, [
				"reset",
				"-q",
				"--",
				...paths
			]);
			return {
				ok: d.ok,
				stderr: d.stderr
			};
		}
		async gitStageAll(cwd) {
			const d = await this.git(cwd, ["add", "-A"]);
			return {
				ok: d.ok,
				stderr: d.stderr
			};
		}
		async gitUnstageAll(cwd) {
			const d = await this.git(cwd, [
				"reset",
				"-q",
				"HEAD"
			]);
			return {
				ok: d.ok,
				stderr: d.stderr
			};
		}
		async gitDiscard(cwd, path, untracked) {
			if (path === "") return {
				ok: false,
				stderr: "no path",
				path
			};
			if (untracked) {
				const d = await this.pwsh("Remove-Item -LiteralPath $args[0] -Recurse -Force", [path]);
				return {
					ok: d.ok,
					stderr: d.stderr,
					path
				};
			}
			const d = await this.git(cwd, [
				"checkout",
				"--",
				path
			]);
			return {
				ok: d.ok,
				stderr: d.stderr,
				path
			};
		}
		async gitCommit(cwd, message) {
			const trimmed = message.trim();
			if (trimmed === "") return {
				ok: false,
				stdout: "",
				stderr: "empty commit message"
			};
			const d = await this.git(cwd, [
				"commit",
				"-m",
				trimmed
			]);
			return {
				ok: d.ok,
				stdout: d.stdout,
				stderr: d.stderr
			};
		}
		async search(cwd, query, caseSensitive) {
			const fs = this.ctx.fs;
			if (fs === void 0) return {
				error: "filesystem service unavailable",
				matches: [],
				files: 0,
				truncated: false
			};
			if (query === "" || cwd === "") return {
				error: "",
				matches: [],
				files: 0,
				truncated: false
			};
			const cfg = this.ideSettings().search;
			if (this.ctx.subprocess !== void 0) {
				const rgArgs = [
					"--json",
					"--no-config",
					"--line-number",
					"-e",
					query,
					...cfg.excludes.flatMap((d) => ["--glob", `!**/${d}/**`]),
					caseSensitive ? "--case-sensitive" : "--ignore-case"
				];
				const rg = await this.run("rg", cwd, rgArgs);
				if (!rg.spawnFailed && (rg.exitCode === 0 || rg.exitCode === 1)) {
					const matches = [];
					for (const line of rg.stdout.split("\n")) {
						if (line === "") continue;
						try {
							const obj = JSON.parse(line);
							if (obj.type === "match" && obj.data) matches.push({
								path: this.str(obj.data.path?.text),
								line: obj.data.line_number ?? 0,
								text: this.str(obj.data.lines?.text).slice(0, 240)
							});
						} catch {}
					}
					const truncated = matches.length > cfg.maxMatches;
					return {
						error: "",
						matches: matches.slice(0, cfg.maxMatches),
						files: new Set(matches.map((m) => m.path)).size,
						truncated
					};
				}
			}
			const q = caseSensitive ? query : query.toLowerCase();
			const matches = [];
			let files = 0;
			let truncated = false;
			const MAX_FILES = cfg.maxFiles;
			const MAX_MATCHES = cfg.maxMatches;
			const SKIP = new Set(cfg.excludes);
			const walk = async (target) => {
				if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return;
				let entries;
				try {
					entries = await fs.listDir(target);
				} catch {
					return;
				}
				for (const e of entries) {
					if (truncated || files >= MAX_FILES || matches.length >= MAX_MATCHES) return;
					if (SKIP.has(e.name)) continue;
					if (e.name.length > 0 && e.name[0] === ".") continue;
					if (e.type === "directory") await walk(e.target);
					else if (e.type === "file") {
						if (typeof e.size === "number" && e.size > 262144) continue;
						files++;
						let text;
						try {
							text = await fs.readText(e.target);
						} catch {
							continue;
						}
						if (text.indexOf("\0") !== -1) continue;
						const lines = text.split(/\r?\n/);
						for (let li = 0; li < lines.length; li++) {
							const line = lines[li];
							if (line === void 0) continue;
							if ((caseSensitive ? line : line.toLowerCase()).indexOf(q) !== -1) {
								matches.push({
									path: this.str(e.target.displayPath),
									line: li + 1,
									text: line.length > 240 ? line.slice(0, 240) : line
								});
								if (matches.length >= MAX_MATCHES) {
									truncated = true;
									break;
								}
							}
						}
					}
				}
			};
			await walk(await fs.resolve(cwd));
			return {
				error: "",
				matches,
				files: new Set(matches.map((m) => m.path)).size,
				truncated
			};
		}
	};
})();
//#endregion
export { IdeService, IdeService as default };
