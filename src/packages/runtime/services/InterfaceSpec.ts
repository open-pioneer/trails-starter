import { Error } from "@open-pioneer/core";
import { ErrorId } from "../errors";
import { InterfaceReferenceMetadata } from "../metadata";

export interface InterfaceSpec {
    interfaceName: string;
    qualifier?: string | undefined;
}

export function renderInterfaceSpec({ interfaceName, qualifier }: InterfaceSpec): string {
    return `'${interfaceName}'` + (qualifier ? ` (qualifier: '${qualifier}')` : "");
}

export interface SingleImplementationSpec extends InterfaceSpec {
    all?: undefined;
}

export interface AllImplementationsSpec extends Pick<InterfaceSpec, "interfaceName"> {
    all: true;
}

export type ReferenceSpec = SingleImplementationSpec | AllImplementationsSpec;

export function parseReferenceSpec(metadata: InterfaceReferenceMetadata): ReferenceSpec {
    if (!metadata) {
        throw new Error(ErrorId.INVALID_METADATA, "Missing reference metadata.");
    }
    if (metadata.all && metadata.qualifier) {
        throw new Error(
            ErrorId.INVALID_METADATA,
            "References can't use 'qualifier' and 'all' properties at the same time."
        );
    }
    if (metadata.all) {
        return {
            all: true,
            interfaceName: metadata.name
        };
    }
    return {
        interfaceName: metadata.name,
        qualifier: metadata.qualifier
    };
}

export function isSingleImplementationSpec(spec: ReferenceSpec): spec is SingleImplementationSpec {
    return !spec.all;
}

export function isAllImplementationsSpec(spec: ReferenceSpec): spec is AllImplementationsSpec {
    return spec.all === true;
}
