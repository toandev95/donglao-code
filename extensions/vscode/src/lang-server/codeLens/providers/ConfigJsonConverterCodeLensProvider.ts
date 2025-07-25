import * as fs from "fs";

import { getConfigYamlPath } from "core/util/paths";
import * as vscode from "vscode";

export class ConfigJsonConverterCodeLensProvider
  implements vscode.CodeLensProvider
{
  public provideCodeLenses(
    document: vscode.TextDocument,
    _: vscode.CancellationToken,
  ): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
    if (
      !document.uri.fsPath.includes(".donglao") ||
      !document.uri.fsPath.endsWith("config.json")
    ) {
      return [];
    }

    if (fs.existsSync(getConfigYamlPath())) {
      return [];
    }

    return [
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "config.json is being deprecated. Convert to config.yaml",
        command: "donglao.convertConfigJsonToConfigYaml",
      }),
    ];
  }
}
