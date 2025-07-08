import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as os from 'os';

/**
 * 数据库文件的存储路径。
 * 默认位于用户主目录下的 .watch-cursor/commits.db
 */
const dbPath = path.join(os.homedir(), '.watch-cursor', 'commits.db');

/**
 * 定义了 Commit 数据对象的结构。
 * 用于在应用中表示和传输一次 Git 提交的相关信息。
 */
export interface Commit {
    /** 记录的唯一ID，由数据库自动生成 */
    id?: number;
    /** 提交发生的时间戳 (毫秒) */
    commit_time: number;
    /** 提交的 Git Hash 值 */
    commit_hash: string;
    /** 提交所在的代码仓库名称 */
    repo: string;
    /** 提交所在的分支名称 */
    branch: string;
    /** 提交者的姓名 */
    committer: string;
    /** 是否被标记为 AI 生成的提交 */
    is_ai_generated: boolean;
    /** 代码体积的增量 (增加的行数 - 删除的行数) */
    code_volume_delta: number;
    /** 代码写入速率的增量 (此版本中为占位符) */
    code_write_speed_delta: number;
    /** 提交时附带的备注信息 */
    notes: string;
}

/**
 * 全局的数据库连接实例。
 * @type {sqlite3.Database}
 */
let db: sqlite3.Database;

/**
 * 连接到 SQLite 数据库。
 * 如果数据库或其所在目录不存在，则会自动创建。
 * 成功连接后会立即尝试创建数据表。
 */
export function connectToDatabase() {
    if (db) {
        return;
    }
    const dir = path.dirname(dbPath);
    // 确保数据库文件所在的目录存在
    if (!require('fs').existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
    }
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database', err);
        } else {
            console.log('Database connected');
            createTable();
        }
    });
}

/**
 * 在数据库中创建 commits 数据表 (如果尚不存在)。
 * 此函数在数据库成功连接后自动调用。
 */
function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS commits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commit_time INTEGER NOT NULL,
            commit_hash TEXT NOT NULL UNIQUE,
            repo TEXT NOT NULL,
            branch TEXT NOT NULL,
            committer TEXT NOT NULL,
            is_ai_generated BOOLEAN NOT NULL,
            code_volume_delta INTEGER NOT NULL,
            code_write_speed_delta INTEGER NOT NULL,
            notes TEXT
        )
    `;
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating table', err);
        }
    });
}

/**
 * 向数据库中插入一条新的提交记录。
 * @param {Commit} commit - 需要插入的提交数据对象。
 * @returns {Promise<void>} - 操作完成时 resolve，发生错误时 reject。
 */
export function insertCommit(commit: Commit): Promise<void> {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO commits (commit_time, commit_hash, repo, branch, committer, is_ai_generated, code_volume_delta, code_write_speed_delta, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(sql, [
            commit.commit_time,
            commit.commit_hash,
            commit.repo,
            commit.branch,
            commit.committer,
            commit.is_ai_generated,
            commit.code_volume_delta,
            commit.code_write_speed_delta,
            commit.notes
        ], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 * 从数据库中检索提交记录。
 * @param {string} [repo] - (可选) 按仓库名称筛选。
 * @param {string} [branch] - (可选) 按分支名称筛选。
 * @returns {Promise<Commit[]>} - 返回一个包含提交记录的数组。
 */
export function getCommits(repo?: string, branch?: string): Promise<Commit[]> {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM commits';
        const params: any[] = [];
        if (repo) {
            sql += ' WHERE repo = ?';
            params.push(repo);
        }
        if (branch) {
            sql += repo ? ' AND' : ' WHERE';
            sql += ' branch = ?';
            params.push(branch);
        }
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows as Commit[]);
            }
        });
    });
}
