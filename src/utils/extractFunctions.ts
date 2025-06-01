import { Project, SyntaxKind } from "ts-morph";

export type ExtractedFunction = {
  name: string;
  code: string;
  filename: string;
  lineNumber: number;
};

export function extractFunctionsFromTS(
  filename: string,
  content: string
): ExtractedFunction[] {
  const project = new Project({
    useInMemoryFileSystem: true
  });

  const sourceFile = project.createSourceFile(filename, content);
  const functions: ExtractedFunction[] = [];

  const functionNodes = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);

  for (const fn of functionNodes) {
    const name = fn.getName() || "<anonymous>";
    const code = fn.getText();
    const lineNumber = fn.getStartLineNumber();

    functions.push({
      name,
      code,
      filename,
      lineNumber
    });
  }

  return functions;
}
