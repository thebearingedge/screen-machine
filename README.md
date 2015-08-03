Notes:

`resolve`: a labeled dependency whose value is a produced by a function that was passed `params`. this function may return a promise (which will need to be resolved... overload much?).

resolve is a per-state construct. it must be an object literal, whose keys correspond to the "names" of one or more resolves.

for speed, resolves contained within a given state hierachy should run in parallel.

children *may* want to wait for parent resolves to complete.

ui-router allows child state resolves & controllers to "inherit" resolved values from their parents via "di". For min-safe code, these child resolves and controllers must be annotated. A basic way to accomplish this is by making the state's `resolve` key or controller an array of resolve names (representing their corresponding resolved values) followed by the target function itself.