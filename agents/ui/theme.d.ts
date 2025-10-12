/**
 * Agentic OS Theme — Color Scheme & Visual Constants
 *
 * Addresses Issue #4 - Rich CLI Output Styling
 *
 * Inspired by:
 * - Vercel CLI (clean, modern)
 * - Vite CLI (fast feedback)
 * - Remix CLI (colorful)
 */
export declare const theme: {
    /**
     * Color Palette (Hex colors for chalk)
     * Carefully chosen for readability in both light and dark terminals
     */
    readonly colors: {
        readonly primary: "#00D9FF";
        readonly primaryDim: "#0099CC";
        readonly success: "#00FF88";
        readonly warning: "#FFB800";
        readonly error: "#FF4444";
        readonly info: "#8B88FF";
        readonly agent: "#FF79C6";
        readonly human: "#F1FA8C";
        readonly muted: "#6B7280";
        readonly border: "#3F3F46";
        readonly background: "#1E1E1E";
        readonly white: "#FFFFFF";
        readonly gradient: readonly ["#00D9FF", "#8B88FF", "#FF79C6"];
    };
    /**
     * Symbols & Icons
     * Using Unicode characters for maximum compatibility
     */
    readonly symbols: {
        readonly success: "✔";
        readonly error: "✖";
        readonly warning: "⚠";
        readonly info: "ℹ";
        readonly question: "?";
        readonly arrow: "→";
        readonly arrowRight: "→";
        readonly arrowLeft: "←";
        readonly arrowUp: "↑";
        readonly arrowDown: "↓";
        readonly bullet: "•";
        readonly circle: "○";
        readonly circleFilled: "●";
        readonly square: "□";
        readonly squareFilled: "■";
        readonly tick: "✓";
        readonly cross: "✗";
        readonly ellipsis: "…";
        readonly pointerSmall: "›";
        readonly star: "★";
        readonly heart: "♥";
        readonly lightning: "⚡";
        readonly fire: "🔥";
        readonly rocket: "🚀";
        readonly robot: "🤖";
        readonly human: "👤";
        readonly spinner: {
            readonly dots: "dots";
            readonly line: "line";
            readonly arc: "arc";
            readonly arrow: "arrow3";
        };
    };
    /**
     * Box Drawing Characters
     * Unicode box-drawing characters for borders
     */
    readonly borders: {
        readonly single: {
            readonly topLeft: "┌";
            readonly topRight: "┐";
            readonly bottomLeft: "└";
            readonly bottomRight: "┘";
            readonly horizontal: "─";
            readonly vertical: "│";
            readonly cross: "┼";
        };
        readonly double: {
            readonly topLeft: "╔";
            readonly topRight: "╗";
            readonly bottomLeft: "╚";
            readonly bottomRight: "╝";
            readonly horizontal: "═";
            readonly vertical: "║";
            readonly cross: "╬";
        };
        readonly round: {
            readonly topLeft: "╭";
            readonly topRight: "╮";
            readonly bottomLeft: "╰";
            readonly bottomRight: "╯";
            readonly horizontal: "─";
            readonly vertical: "│";
            readonly cross: "┼";
        };
        readonly bold: {
            readonly topLeft: "┏";
            readonly topRight: "┓";
            readonly bottomLeft: "┗";
            readonly bottomRight: "┛";
            readonly horizontal: "━";
            readonly vertical: "┃";
            readonly cross: "╋";
        };
        readonly heavyDash: {
            readonly topLeft: "╒";
            readonly topRight: "╕";
            readonly bottomLeft: "╘";
            readonly bottomRight: "╛";
            readonly horizontal: "═";
            readonly vertical: "│";
            readonly cross: "┼";
        };
    };
    /**
     * Boxen Styles (for boxen library)
     */
    readonly boxStyles: {
        readonly round: "round";
        readonly single: "single";
        readonly double: "double";
        readonly bold: "bold";
        readonly singleDouble: "singleDouble";
        readonly doubleSingle: "doubleSingle";
        readonly classic: "classic";
    };
    /**
     * Spacing & Layout
     */
    readonly spacing: {
        readonly padding: {
            readonly small: 1;
            readonly medium: 2;
            readonly large: 3;
        };
        readonly margin: {
            readonly small: 1;
            readonly medium: 2;
            readonly large: 3;
        };
        readonly indent: "  ";
        readonly doubleIndent: "    ";
    };
    /**
     * Typography
     */
    readonly typography: {
        readonly bold: true;
        readonly dim: true;
        readonly italic: false;
        readonly underline: true;
        readonly strikethrough: false;
        readonly h1: {
            readonly bold: true;
            readonly color: "primary";
        };
        readonly h2: {
            readonly bold: true;
            readonly color: "primaryDim";
        };
        readonly h3: {
            readonly bold: false;
            readonly color: "primary";
        };
    };
    /**
     * Progress Bar Characters
     */
    readonly progressBar: {
        readonly complete: "█";
        readonly incomplete: "░";
        readonly head: "▓";
        readonly alt: {
            readonly complete: "■";
            readonly incomplete: "□";
            readonly head: "▣";
        };
    };
    /**
     * Dividers
     */
    readonly dividers: {
        readonly light: string;
        readonly heavy: string;
        readonly double: string;
        readonly dashed: string;
        readonly dotted: string;
    };
};
/**
 * Agent-specific color assignments
 */
export declare const agentColors: {
    readonly CoordinatorAgent: "#FF79C6";
    readonly CodeGenAgent: "#00D9FF";
    readonly ReviewAgent: "#8B88FF";
    readonly IssueAgent: "#00FF88";
    readonly PRAgent: "#0099CC";
    readonly DeploymentAgent: "#FFB800";
    readonly SCRIPT: "#8B88FF";
    readonly REGISTRATION: "#0099CC";
    readonly Unknown: "#6B7280";
};
/**
 * Severity level colors
 */
export declare const severityColors: {
    readonly 'Sev.1-Critical': "#FF4444";
    readonly 'Sev.2-High': "#FFB800";
    readonly 'Sev.3-Medium': "#8B88FF";
    readonly 'Sev.4-Low': "#6B7280";
};
/**
 * Phase colors
 */
export declare const phaseColors: {
    readonly 'Phase 1': "#FF6B6B";
    readonly 'Phase 2': "#FFA500";
    readonly 'Phase 3': "#FFD700";
    readonly 'Phase 4': "#00FF88";
    readonly 'Phase 5': "#00D9FF";
    readonly 'Phase 6': "#8B88FF";
    readonly 'Phase 7': "#FF79C6";
    readonly 'Phase 8': "#F1FA8C";
    readonly 'Phase 9': "#BD93F9";
    readonly 'Phase 10': "#50FA7B";
};
export type Theme = typeof theme;
export type AgentName = keyof typeof agentColors;
export type SeverityLevel = keyof typeof severityColors;
export type PhaseLevel = keyof typeof phaseColors;
//# sourceMappingURL=theme.d.ts.map