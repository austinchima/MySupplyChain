using System.Diagnostics;
using System.Runtime.InteropServices;

namespace MySupplyChain.Launcher;

class Program
{
    // Relative paths from solution root
    private const string ModelTrainerProject = "MySupplyChain.ModelTrainer/MySupplyChain.ModelTrainer.csproj";
    private const string ApiProject = "MySupplyChain.API/MySupplyChain.API.csproj";
    private const string ModelsDirectory = "MySupplyChain.Infrastructure/MLModels";
    private const string RequiredModelFile = "sales_model.zip";

    static async Task<int> Main(string[] args)
    {
        var solutionRoot = FindSolutionRoot();
        if (solutionRoot is null)
        {
            PrintError(
                "Could not locate solution root (.slnx / .sln file). Run this from inside the MySupplyChain folder.");
            return 1;
        }

        PrintBanner();

        // ── Step 1: Train ML model if it doesn't exist ───────────────────────
        var modelPath = Path.Combine(solutionRoot, ModelsDirectory, RequiredModelFile);
        if (!File.Exists(modelPath))
        {
            PrintStep(1, "ML model not found. Running ModelTrainer first...");
            var trainerResult = await RunProjectAsync(solutionRoot, ModelTrainerProject, args);
            if (trainerResult != 0)
            {
                PrintError("ModelTrainer failed. Fix the trainer errors above, then try again.");
                return trainerResult;
            }

            PrintSuccess("ML model trained and saved.");
        }
        else
        {
            PrintStep(1, $"ML model found ({RequiredModelFile}). Skipping training.");
        }

        // ── Step 2: Start the API ─────────────────────────────────────────────
        PrintStep(2, "Starting MySupplyChain API...");
        Console.WriteLine();
        return await RunProjectAsync(solutionRoot, ApiProject, args, attach: true);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>
    /// Runs a dotnet project and returns its exit code.
    /// When <paramref name="attach"/> is true the child process inherits this
    /// console so Ctrl+C / Ctrl+Break propagate naturally.
    /// </summary>
    static async Task<int> RunProjectAsync(
        string workingDir,
        string projectRelativePath,
        string[] extraArgs,
        bool attach = false)
    {
        var dotnet = GetDotnetExecutable();
        var projectFull = Path.Combine(workingDir, projectRelativePath);

        // Forward any extra args the user passed (e.g. --urls, --environment)
        var argString = $"run --project \"{projectFull}\"";
        if (extraArgs.Length > 0)
            argString += " -- " + string.Join(" ", extraArgs);

        var psi = new ProcessStartInfo
        {
            FileName = dotnet,
            Arguments = argString,
            WorkingDirectory = workingDir,
            UseShellExecute = false,
            RedirectStandardOutput = !attach,
            RedirectStandardError = !attach,
            CreateNoWindow = false,
        };

        using var process = new Process();
        process.StartInfo = psi;
        process.EnableRaisingEvents = true;

        if (!attach)
        {
            // Capture and relay output for ModelTrainer
            process.OutputDataReceived += (_, e) =>
            {
                if (e.Data != null) Console.WriteLine(e.Data);
            };
            process.ErrorDataReceived += (_, e) =>
            {
                if (e.Data != null) PrintError(e.Data);
            };
        }

        process.Start();

        if (!attach)
        {
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
        }

        await process.WaitForExitAsync();
        return process.ExitCode;
    }

    static string? FindSolutionRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null)
        {
            if (dir.GetFiles("*.slnx").Length > 0 || dir.GetFiles("*.sln").Length > 0)
                return dir.FullName;
            dir = dir.Parent;
        }

        return null;
    }

    static string GetDotnetExecutable() =>
        RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? "dotnet.exe" : "dotnet";

    // ── Console formatting ────────────────────────────────────────────────────

    static void PrintBanner()
    {
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine();
        Console.WriteLine("  ╔══════════════════════════════════════════╗");
        Console.WriteLine("  ║   🚛  MySupplyChain  — Smart Launcher    ║");
        Console.WriteLine("  ╚══════════════════════════════════════════╝");
        Console.ResetColor();
        Console.WriteLine();
    }

    static void PrintStep(int step, string message)
    {
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.Write($"  [{step}] ");
        Console.ResetColor();
        Console.WriteLine(message);
    }

    static void PrintSuccess(string message)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"  ✓  {message}");
        Console.ResetColor();
        Console.WriteLine();
    }

    static void PrintError(string message)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine($"  ✗  {message}");
        Console.ResetColor();
    }
}
