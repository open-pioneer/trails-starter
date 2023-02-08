export interface InterfaceSpec {
    interfaceName: string;
    qualifier?: string | undefined;
}

export function renderInterfaceSpec({ interfaceName, qualifier }: InterfaceSpec): string {
    return `'${interfaceName}'` + (qualifier ? ` (qualifier: '${qualifier}')` : "");
}
