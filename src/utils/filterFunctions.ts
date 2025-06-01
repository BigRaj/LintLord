import { ExtractedFunction } from "./extractFunctions";

export function filterReviewableFunctions(functions: ExtractedFunction[]): ExtractedFunction[] {
  return functions.filter(fn => {
    const lines = fn.code.split("\n");
    const lineCount = lines.length;
    const charCount = fn.code.length;

    // Heuristics
    return lineCount >= 5 && charCount >= 150;
  });
}
