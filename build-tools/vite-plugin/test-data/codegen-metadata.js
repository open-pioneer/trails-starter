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
          name: "ServiceC",
          qualifier: "C"
        }],
        references: {
          "asd": {
            name: "ServiceD",
            qualifier: "D"
          }
        }
      }
    },
    ui: {
      references: [{
        name: "foo.ServiceE",
        qualifier: void 0
      }, {
        name: "foo.ServiceF",
        qualifier: "F"
      }]
    },
    properties: {
      "some_property": {
        value: "default_value",
        required: true
      }
    }
  }
};