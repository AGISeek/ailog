import * as vscode from 'vscode';
import { DashboardService } from '../services/ui/dashboardService';

/**
 * 仪表板命令处理器
 */
export class DashboardCommand {
    public static readonly ID = 'ailog.showDashboard';

    constructor(private dashboardService: DashboardService) {}

    public register(context: vscode.ExtensionContext): void {
        const command = vscode.commands.registerCommand(DashboardCommand.ID, () => {
            this.execute(context);
        });

        context.subscriptions.push(command);
    }

    private execute(context: vscode.ExtensionContext): void {
        this.dashboardService.createDashboardPanel(context);
    }
}