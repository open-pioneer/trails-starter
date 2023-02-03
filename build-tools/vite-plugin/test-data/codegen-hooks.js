var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { createContext, useContext, useMemo } from "/home/michael/projects/starter/node_modules/.pnpm/react@18.2.0/node_modules/react/index.js";
const GlobalError = globalThis.Error;
class Error2 extends GlobalError {
  constructor(id, text, options) {
    super(`${id}: ${text}`, options);
    __publicField(this, "id");
    __publicField(this, "text");
    this.id = id;
    this.text = text;
  }
}
const PackageContext = createContext(null);
var ErrorId = /* @__PURE__ */ ((ErrorId2) => {
  ErrorId2["INVALID_METADATA"] = "runtime:invalid-metadata";
  ErrorId2["PROPERTY_RESOLUTION_FAILED"] = "runtime:property-resolution-failed";
  ErrorId2["INVALID_PROPERTY_NAME"] = "runtime:invalid-property-name";
  ErrorId2["REQUIRED_PROPERTY"] = "runtime:required-property";
  ErrorId2["INTERFACE_NOT_FOUND"] = "runtime:interface-not-found";
  ErrorId2["UNDECLARED_DEPENDENCY"] = "runtime:undeclared-dependency";
  ErrorId2["SERVICE_CONSTRUCTION_FAILED"] = "runtime:service-construction-failed";
  ErrorId2["SERVICE_DESTRUCTION_FAILED"] = "runtime:service-destruction-failed";
  ErrorId2["DUPLICATE_INTERFACE"] = "runtime:duplicate-interface";
  ErrorId2["DEPENDENCY_CYCLE"] = "runtime:dependency-cycle";
  ErrorId2["INTERNAL"] = "runtime:internal-error";
  return ErrorId2;
})(ErrorId || {});
function useServiceInternal(packageName, interfaceName) {
  const context = useContext(PackageContext);
  const service = useMemo(
    () => checkContext("useService", context).getService(packageName, interfaceName),
    [context, packageName, interfaceName]
  );
  return service;
}
function usePropertiesInternal(packageName) {
  const context = useContext(PackageContext);
  return checkContext("useProperties", context).getProperties(packageName);
}
function checkContext(hookName, contextData) {
  if (!contextData) {
    throw new Error2(
      ErrorId.INTERNAL,
      `"Failed to access package context from '${hookName}': react integration was not set up properly.`
    );
  }
  return contextData;
}
const PACKAGE_NAME$2 = "test-app";
const useService$2 = useServiceInternal.bind(void 0, PACKAGE_NAME$2);
const useProperties = usePropertiesInternal.bind(void 0, PACKAGE_NAME$2);
const PACKAGE_NAME$1 = "package1";
const useService$1 = useServiceInternal.bind(void 0, PACKAGE_NAME$1);
usePropertiesInternal.bind(void 0, PACKAGE_NAME$1);
function Component$2() {
  const service = useService$1("import.from.package1");
  return /* @__PURE__ */ React.createElement("div", null, service.message);
}
const PACKAGE_NAME = "package2";
const useService = useServiceInternal.bind(void 0, PACKAGE_NAME);
usePropertiesInternal.bind(void 0, PACKAGE_NAME);
function Component$1() {
  const service = useService("import.from.package2");
  return /* @__PURE__ */ React.createElement("div", null, service.message);
}
function Component() {
  const service = useService$2("import.from.app");
  const properties = useProperties();
  return /* @__PURE__ */ React.createElement("div", null, service.message, properties.message, /* @__PURE__ */ React.createElement(Component$2, null), /* @__PURE__ */ React.createElement(Component$1, null));
}
console.log(Component);
