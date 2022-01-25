import { Event, Uri } from 'vscode';

export type Resource = Uri | undefined;

export interface InterpreterDetailsOptions {
    useCache: boolean;
}

export interface InterpreterDetails {
    path: string;
    version: string[];
    environmentType: string[];
    metadata: Record<string, unknown>;
}

export interface InterpretersChangedParams {
    path?: string;
    type: 'add' | 'remove' | 'update' | 'clear-all';
}

export interface ActiveInterpreterChangedParams {
    interpreterPath?: string;
    resource?: Uri;
}

export interface RefreshInterpretersOptions {
    clearCache?: boolean;
}

export interface IProposedExtensionAPI {
    environment: {
        /**
         * Returns the path to the python binary selected by the user or as in the settings.
         * This is just the path to the python binary, this does not provide activation or any
         * other activation command. The `resource` if provided will be used to determine the
         * python binary in a multi-root scenario. If resource is `undefined` then the API
         * returns what ever is set for the workspace.
         * @param resource : Uri of a file or workspace
         */
        getActiveInterpreterPath(resource?: Resource): Promise<string | undefined>;
        /**
         * Returns details for the given interpreter. Details such as absolute interpreter path,
         * version, type (conda, pyenv, etc). Metadata such as `sysPrefix` can be found under
         * metadata field.
         * @param interpreterPath : Path of the interpreter whose details you need.
         * @param options : [optional]
         *     * useCache : When true, cache is checked first for any data, returns even if there
         *                  is partial data.
         */
        getInterpreterDetails(
            interpreterPath: string,
            options?: InterpreterDetailsOptions,
        ): Promise<InterpreterDetails | undefined>;
        /**
         * Returns paths to interpreters found by the extension at the time of calling. This API
         * will *not* trigger a refresh. If a refresh is going on it will *not* wait for the refresh
         * to finish. This will return what is known so far. To get complete list `await` on promise
         * returned by `getRefreshPromise()`.
         */
        getInterpreterPaths(): Promise<string[] | undefined>;
        /**
         * Sets the active interpreter path for the python extension. Configuration target will
         * always be the workspace.
         * @param interpreterPath : Interpreter path to set for a given workspace.
         * @param resource : [optional] Uri of a file ro workspace to scope to a particular workspace
         *                   folder.
         */
        setActiveInterpreter(interpreterPath: string, resource?: Resource): Promise<void>;
        /**
         * This API will re-trigger environment discovery. Extensions can wait on the returned
         * promise to get the updated interpreters list. If there is a refresh already going on
         * then it returns the promise for that refresh.
         * @param options : [optional]
         *     * clearCache : When true, this will clear the cache before interpreter refresh
         *                    is triggered.
         */
        refreshInterpreters(options?: RefreshInterpretersOptions): Promise<string[] | undefined>;
        /**
         * Returns a promise for the ongoing refresh. Returns `undefined` if there are no active
         * refreshes going on.
         */
        getRefreshPromise(): Promise<void> | undefined;
        /**
         * This event is triggered when the known interpreters list changes, like when a interpreter
         * is found, existing interpreter is removed, or some details changed on an interpreter.
         */
        onDidInterpretersChanged: Event<InterpretersChangedParams[]>;
        /**
         * This event is triggered when the active interpreter changes.
         */
        onDidActiveInterpreterChanged: Event<ActiveInterpreterChangedParams>;
    };
}