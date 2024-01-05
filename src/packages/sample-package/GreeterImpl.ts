// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Greeter } from "./index";

export class GreeterImpl implements Greeter {
    greet() {
        return "Hello from Greeter";
    }
}
