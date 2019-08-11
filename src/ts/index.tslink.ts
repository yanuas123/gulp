/* IMPORTMODULES ------------------------------------------------------------ */

/* jQuery connect ---------------- */
import * as $ from "jquery";
/// <reference path="@types/js-global.d.ts"/>

// @tslink:inject plug-modules/index.tslink.ts

import {performTooltip} from "./plug-modules/tooltip";

import {CopyTextToBuffer} from "./plug-modules/tobuffer-copy";

import {loadMore} from "./plug-modules/load-more";

import {PopupProp, PopupTrigger} from "./plug-modules/popup";

import {LocPopup} from "./plug-modules/local-popup";

import {RangeProp, RangeValues, RangeErrMsg, rangeDQS, RangeFilter} from "./plug-modules/range-filter";

import {TemplateTypes, SubmitEl, InpArg, FormArg, formData, validationServerCall, formCallFunc, validationCallFunc, ValidationProp, Validation} from "./plug-modules/validation";

import {ajax_methods, ajax_content_type, postReqObj, getReqObj, putReqObj, delReqObj, ajax_prop, Request_} from "./plug-modules/ajax";

import {addSelectCountries, select_form_data} from "./plug-modules/select-countries";


/* launch validation ------------------- */
let validation = new Validation();

/* launch popup functionality ---------- */
let Popup = new PopupTrigger();
Popup.launchModule();

let LocalPopup = new LocPopup("local_popup_parent");

/* end IMPORT MODULES ------------------------------------------------------- */
/* ========================================================================== */