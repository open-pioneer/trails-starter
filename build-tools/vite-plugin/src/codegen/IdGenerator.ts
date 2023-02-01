/**
 * Generates unique identifiers from source strings.
 * Non-representable characters are removed and numbers are added if the identifier is not unique.
 */
export class IdGenerator {
    private existing = new Map<string, number>();

    /**
     * Returns a unique identifier (in the context of this instance) that resembles the input value.
     */
    generate(input: string): string {
        const clean = cleanName(input);

        const existing = this.existing;
        const count = existing.get(clean) ?? 0;
        existing.set(clean, count + 1);
        return count === 0 ? clean : `${clean}_${count}`;
    }
}

function cleanName(input: string) {
    let clean = input.replace(/[^A-Za-z0-9_]+/g, "_"); // remove non-alphanumeric
    clean = clean.replace(/[\d_]+$/, ""); // strip trailing numbers / underscore to prevent conflicts
    if (/^\d/.test(clean)) {
        clean = "_" + clean; // ensure variable name does not start with a number
    }
    return clean || "var";
}
