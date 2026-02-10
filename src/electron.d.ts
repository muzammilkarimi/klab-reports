export {};

declare global {
  interface Window {
    electron: {
      ping: () => Promise<string>;
      printReport: (reportId: number, suggestedName?: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    };
  }
}
