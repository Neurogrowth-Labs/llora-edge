import { execFile } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const MAX_IFC_BYTES = 100 * 1024 * 1024;

export class IfcConversionError extends Error {
  constructor(message: string, public readonly status = 422) {
    super(message);
  }
}

/**
 * Converts IFC with IfcOpenShell's IfcConvert command-line tool.
 *
 * Keeping this behind a server boundary avoids shipping a native BIM engine to
 * the browser; the client receives a standard GLB that the existing Three.js
 * renderer can load. Set IFCOPENSHELL_BINARY when IfcConvert is not on PATH.
 */
export async function convertIfcToGlb(source: Buffer, sourceName: string): Promise<Buffer> {
  if (!source.length) throw new IfcConversionError("The IFC file is empty.", 400);
  if (source.length > MAX_IFC_BYTES) throw new IfcConversionError("IFC files must be 100 MB or smaller.", 413);
  if (!sourceName.toLowerCase().endsWith(".ifc")) {
    throw new IfcConversionError("Only .ifc files can be converted.", 415);
  }

  const workspace = await mkdtemp(path.join(os.tmpdir(), "llora-ifc-"));
  const inputPath = path.join(workspace, "model.ifc");
  const outputPath = path.join(workspace, "model.glb");

  try {
    await writeFile(inputPath, source, { mode: 0o600 });
    const binary = process.env.IFCOPENSHELL_BINARY || "IfcConvert";
    await execFileAsync(binary, [inputPath, outputPath, "--use-element-guids"], {
      timeout: 120_000,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    });
    return await readFile(outputPath);
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      throw new IfcConversionError(
        "IFC conversion is not configured. Install IfcOpenShell's IfcConvert or set IFCOPENSHELL_BINARY.",
        503
      );
    }
    if (error instanceof IfcConversionError) throw error;
    throw new IfcConversionError("IfcOpenShell could not convert this IFC model.");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}
