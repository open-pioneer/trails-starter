import { ServiceA as test_ServiceA } from "entryPoint";
import { ServiceB as test_ServiceB } from "entryPoint";
export default {
  "test": {
    name: "test",
    services: {
      "ServiceA": {
        name: "ServiceA",
        clazz: test_ServiceA,
        provides: [],
        references: {}
      },
      "ServiceB": {
        name: "ServiceB",
        clazz: test_ServiceB,
        provides: [{
          name: "ServiceC"
        }],
        references: {
          "asd": {
            name: "ServiceD"
          }
        }
      }
    }
  }
};