import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as os from 'os';

const dbPath = path.join(os.homedir(), '.watch-cursor', 'commits.db');

export interface Commit {
    id?: number;
    commit_time: number;
    commit_hash: string;
    repo: string;
    branch: string;
    committer: string;
    is_ai_generated: boolean;
    code_volume_delta: number;
    code_write_speed_delta: number;
    notes: string;
}

let db: sqlite3.Database;

export function connectToDatabase() {
    if (db) {
        return;
    }
    const dir = path.dirname(dbPath);
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
