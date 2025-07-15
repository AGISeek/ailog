import * as fs from 'fs';
import { ActivityLogEntry } from '../../types';

/**
 * 时间邻近性分析器类
 * 
 * 负责分析代码变更与AI命令执行的时间关系。这是最可靠的AI检测信号之一，
 * 因为它直接关联了用户的AI命令执行和随后的代码变更。
 * 
 * 时间邻近性分析基于以下假设：
 * - AI生成的代码变更通常紧随AI命令执行之后
 * - 时间间隔越短，AI生成的可能性越高
 * 
 * @class TimeProximityAnalyzer
 */
export class TimeProximityAnalyzer {
    /** 活动日志文件路径 */
    private readonly logPath: string;
    
    /** 活动记录的最大保存时间（24小时） */
    private readonly maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    /** 时间邻近性检测窗口（5秒） */
    private readonly proximityWindow = 5000; // 5秒

    /**
     * 构造函数
     * 
     * @param logPath - 活动日志文件的存储路径
     */
    constructor(logPath: string) {
        this.logPath = logPath;
    }

    /**
     * 分析文件的时间邻近性并返回得分
     * 
     * 通过检查指定文件是否在最近的时间窗口内有AI命令活动，
     * 来判断当前的代码变更是否可能由AI生成。
     * 
     * @param filePath - 要分析的文件路径
     * @returns 包含得分和匹配活动的对象
     */
    public analyzeTimeProximity(filePath: string): { score: number; matchedActivity?: ActivityLogEntry } {
        try {
            const activities = this.loadActivityLog();
            const now = Date.now();
            
            // 查找最近的活动记录
            const recentActivity = activities.find(activity => 
                activity.file === filePath && 
                (now - activity.timestamp) < this.proximityWindow
            );

            if (recentActivity) {
                const timeDelta = now - recentActivity.timestamp;
                
                // 根据时间差返回不同的得分
                if (timeDelta < 1000) { // 1秒内 - 极高置信度
                    return { score: 50, matchedActivity: recentActivity };
                } else if (timeDelta < 3000) { // 3秒内 - 高置信度
                    return { score: 40, matchedActivity: recentActivity };
                } else { // 5秒内 - 中等置信度
                    return { score: 30, matchedActivity: recentActivity };
                }
            }

            return { score: 0 };
        } catch (error) {
            console.error('Time proximity analysis failed:', error);
            return { score: 0 };
        }
    }

    /**
     * 记录AI命令活动
     * 
     * 当检测到AI命令执行时，记录相关信息用于后续的时间邻近性分析。
     * 
     * @param file - 受影响的文件路径
     * @param command - 执行的AI命令
     */
    public recordActivity(file: string, command: string): void {
        try {
            const activities = this.loadActivityLog();
            
            /** 新的活动记录 */
            const newActivity: ActivityLogEntry = {
                file,
                timestamp: Date.now(),
                command
            };

            activities.push(newActivity);
            
            // 保留最近100条记录，避免日志文件过大
            const recentActivities = activities.slice(-100);
            this.saveActivityLog(recentActivities);
        } catch (error) {
            console.error('Failed to record activity:', error);
        }
    }

    /**
     * 清理过期的活动记录
     * 
     * 定期清理超过最大保存时间的活动记录，保持日志文件的合理大小。
     */
    public cleanupOldActivities(): void {
        try {
            const activities = this.loadActivityLog();
            const now = Date.now();
            
            // 过滤出仍在有效期内的活动
            const validActivities = activities.filter(
                activity => (now - activity.timestamp) < this.maxAge
            );
            
            this.saveActivityLog(validActivities);
        } catch (error) {
            console.error('Failed to cleanup old activities:', error);
        }
    }

    /**
     * 从文件加载活动日志
     * 
     * 读取并解析活动日志文件，返回活动记录数组。
     * 
     * @returns 活动记录数组
     * @private
     */
    private loadActivityLog(): ActivityLogEntry[] {
        try {
            if (!fs.existsSync(this.logPath)) {
                return [];
            }

            const logData = fs.readFileSync(this.logPath, 'utf8');
            return logData
                .split('\n')
                .filter(line => line.trim()) // 过滤空行
                .map(line => JSON.parse(line)); // 解析JSON
        } catch (error) {
            console.error('Failed to load activity log:', error);
            return [];
        }
    }

    /**
     * 保存活动日志到文件
     * 
     * 将活动记录数组序列化并写入日志文件。
     * 
     * @param activities - 要保存的活动记录数组
     * @private
     */
    private saveActivityLog(activities: ActivityLogEntry[]): void {
        try {
            const logData = activities
                .map(activity => JSON.stringify(activity))
                .join('\n');
            
            fs.writeFileSync(this.logPath, logData);
        } catch (error) {
            console.error('Failed to save activity log:', error);
        }
    }
}