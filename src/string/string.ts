export function makeExportName(file: string): string {
    return sanitizeVarName(file.replace(/[\/\\]+/g, '_').replace(/[-.]/g, '_'));
}
export function sanitizeVarName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_$]/g, '_').replace(/^[^a-zA-Z_$]/, '_$&');
}
