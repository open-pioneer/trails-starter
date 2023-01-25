import { ServiceA as import_1 } from "entryPoint";
import { ServiceB as import_2 } from "entryPoint";
export default {
  "test": {
    name: "test",
    services: {
      "ServiceA": {
        name: "ServiceA",
        clazz: import_1,
        provides: [],
        references: {}
      },
      "ServiceB": {
        name: "ServiceB",
        clazz: import_2,
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