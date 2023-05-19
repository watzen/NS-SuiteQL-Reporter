/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
import { EntryPoints } from 'N/types'
import { hideAllFields } from "./hooks/hideAllFields";
import { addSuiteQLResults } from "./hooks/addSuiteQLResults";
import {upsertReportColumns} from "./hooks/upsertReportColumns";

const beforeLoadHooks = [
    hideAllFields,
    addSuiteQLResults,
]

const afterSubmitHooks = [
    upsertReportColumns,
]

export const beforeLoad = (context: EntryPoints.UserEvent.beforeLoadContext):void => beforeLoadHooks.forEach(hook => hook(context))

export const afterSubmit = (context: EntryPoints.UserEvent.afterSubmitContext):void => afterSubmitHooks.forEach(hook => hook(context))
