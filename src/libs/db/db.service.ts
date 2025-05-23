import path from 'node:path';

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception';
import { getConnectionToken } from '@nestjs/sequelize';
import { SequelizeCoreModule } from '@nestjs/sequelize/dist/sequelize-core.module';
import colors from 'colors';
import * as CacheDB from 'me-cache-db';
import { Model, Order, QueryTypes, Sequelize, WhereOptions } from 'sequelize';
import { ModelCtor, getAttributes } from 'sequelize-typescript';
import winston from 'winston';

import { ConfigService } from '@libs/config';
import { env } from '@libs/utils';

export type DB = string | Sequelize;
export interface BaseAttributes {
	id?: any;
	createdAt?: any;
	updatedAt?: any;
	deletedAt?: any;
}
export type Repo = ModelCtor;
export interface RepoOptions {
	db: DB;
	tbn: string;
	tmodel: ModelCtor;
}
export interface RepoOptionsTbnWhere {
	db: DB;
	tbn?: string;
	tbnWhere?: CacheDB.SqlStatement | { name: CacheDB.Where };
	tmodel: ModelCtor;
}
export interface RepoData {
	db: Sequelize;
	dbn: string;
	tbn: string;
	tbnAlias: string;
	tmodel: ModelCtor;
	repo: Repo;
	rid: string;
}

const sqlLoggerLevel = {
	production: { level: 'info', types: ['SELECT'] },
	staging: { level: 'verbose', types: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'BULKDELETE', 'BULKUPDATE'] },
	default: { level: 'debug', types: undefined },
};
export const SqlLogger = winston.createLogger({
	level: sqlLoggerLevel[env] ? sqlLoggerLevel[env].level : sqlLoggerLevel.default.level,
	format: winston.format.combine(
		winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
		winston.format.ms(),
		winston.format.printf((info: any) => {
			let { timestamp, ms, message, meta } = info;
			let type = `${meta?.type || 'UNKNOWN'}`.padStart(11, ' ');
			return `${colors.blue(`[Sequelize]`)} ${timestamp} ${colors.blue(`${type}`)} ${colors.blue.dim(message)} ${colors.yellow(ms)}`;
		})
	),
	transports: [new winston.transports.Console()],
});

export function getSequelizeConfig(name: string, thisConfig: any, dbConfig: any) {
	let baseConfig = dbConfig[`base_${thisConfig.dialect}`];
	let sequelizeConfig = {
		database: name,
		autoLoadModels: true,
		synchronize: true,
		repositoryMode: true,
		logging: (msg, options) => {
			let loggerConfig = sqlLoggerLevel[env] || sqlLoggerLevel.default;
			if (!loggerConfig.types || loggerConfig.types.includes(options.type)) {
				SqlLogger[loggerConfig.level](msg, { meta: options });
			} else {
				SqlLogger.debug(msg, { meta: options });
			}
		},
		//通用基础配置
		...baseConfig,
		//单独配置
		name,
		...thisConfig,
	};
	//其他
	if (thisConfig.dialect === 'sqlite') {
		if (!thisConfig.storage) {
			sequelizeConfig.storage = path.resolve(baseConfig.storage, `${name}.sqlite`);
		}
	}
	//
	//console.log(sequelizeConfig);
	return sequelizeConfig;
}

export type BulkCreatUpdateFields = string | string[] | { exclude: string | string[] };
export type BulkCreatConflictFields = string | string[];

@Injectable()
export class DBService implements OnApplicationShutdown {
	private dynamicDBMap: { [db: string]: Sequelize } = {};

	constructor(
		private moduleRef: ModuleRef,
		private configService: ConfigService
	) {}

	//销毁sequelize实例
	async onApplicationShutdown() {
		for (let n in this.dynamicDBMap) {
			await this.dynamicDBMap[n].close();
		}
		this.dynamicDBMap = {};
	}

	//DB & Repo
	public async getDBConnection(db: DB) {
		if (typeof db !== 'string') return db;
		//
		try {
			return this.moduleRef.get(getConnectionToken(db), { strict: false });
		} catch (e) {
			if (!(e instanceof UnknownElementException)) {
				throw e;
			}
		}
		//
		if (!this.dynamicDBMap[db]) {
			let dbConfig = this.configService.get('db');
			for (let key in dbConfig) {
				let thisConfig = dbConfig[key];
				if (
					thisConfig.matches &&
					((typeof thisConfig.matches === 'function' && thisConfig.matches(db, key)) || db.match(thisConfig.matches))
				) {
					let sequelizeConfig = getSequelizeConfig(db, thisConfig, dbConfig);
					this.dynamicDBMap[db] = await (SequelizeCoreModule as any).createConnectionFactory(sequelizeConfig);
					break;
				}
			}
		}
		return this.dynamicDBMap[db];
	}
	//
	public getTbnAlias(tbn: string) {
		let index = tbn.indexOf('.');
		return index < 0 ? tbn : tbn.substring(index + 1);
	}
	public isRepo(r: any) {
		return typeof r === 'function';
	}
	public isRepoData(r: any) {
		return typeof r === 'object' && r.db && r.repo && r.rid;
	}
	private async getRepoByOptions(options: RepoOptions) {
		let { db, tbn, tmodel } = options;
		let sequelize = typeof db === 'string' ? await this.getDBConnection(db) : db;
		if (!sequelize.isDefined(tbn)) {
			await sequelize
				.define(tbn, getAttributes(tmodel.prototype || tmodel), {
					tableName: tbn,
					timestamps: true,
					paranoid: true,
				})
				.sync();
		}
		//
		let repo: any = sequelize.models[tbn];
		if (!repo.$data)
			repo.$data = {
				db: sequelize,
				dbn: sequelize.getDatabaseName(),
				tbn,
				tbnAlias: this.getTbnAlias(tbn),
				tmodel,
				repo,
				rid: `${sequelize.getDatabaseName()}.${tbn}`,
			};
		(options as any).$data = repo.$data;
		return repo as Repo;
	}
	public async getRepoData(r: Repo | Model | RepoOptions | RepoData | any): Promise<RepoData> {
		if (r.$data) return r.$data;
		//RepoData
		if (this.isRepoData(r)) return r as RepoData;
		//Repo
		if (typeof r === 'function') {
			let data: any = {};
			data.db = r.sequelize;
			data.dbn = r.sequelize.getDatabaseName();
			data.tbn = r.getTableName();
			data.tbnAlias = this.getTbnAlias(data.tbn);
			data.tmodel = r;
			data.repo = r;
			data.rid = `${data.dbn}.${data.tbn}`;
			return (r.$data = data);
		}
		//Model
		if (r instanceof Model) {
			let data: any = {};
			data.db = r.sequelize;
			data.dbn = r.sequelize.getDatabaseName();
			data.tbn = (r.constructor as any).getTableName();
			data.tbnAlias = this.getTbnAlias(data.tbn);
			data.tmodel = r.constructor;
			data.repo = r.constructor;
			data.rid = `${data.dbn}.${data.tbn}`;
			return ((r as any).$data = data);
		}
		//RepoOptions
		return ((await this.getRepoByOptions(r)) as any).$data;
	}
	public getRepoAllFields(r: Repo, customFieldsOnly?: boolean, options?: { id?: boolean; date?: boolean }) {
		let keys: any;
		if (customFieldsOnly) {
			keys = { ...Reflect.getMetadata('sequelize:attributes', r.prototype) };
		} else {
			try {
				keys = r.getAttributes();
			} catch (e) {
				keys = {
					id: '',
					...Reflect.getMetadata('sequelize:attributes', r.prototype),
					createdAt: '',
					updatedAt: '',
					deletedAt: '',
				};
				if (options?.id === false) delete keys.id;
				if (options?.date === false) {
					delete keys.createdAt;
					delete keys.updatedAt;
					delete keys.deletedAt;
				}
			}
		}
		return Object.keys(keys);
	}
	//Sql通用方法
	public async dbGetTables(
		db: DB,
		tbnWhere?: CacheDB.SqlStatement | { name: CacheDB.Where }
	): Promise<{ name: string }[]> {
		let sequelize = typeof db === 'string' ? await this.getDBConnection(db) : db;
		//解析where sql
		let whereSql = '';
		if (tbnWhere) whereSql = typeof tbnWhere === 'string' ? tbnWhere : typeof tbnWhere === 'function' ? tbnWhere() : '';
		//各种数据库获取表的方法不同
		if (sequelize.getDialect() === 'sqlite') {
			if (!whereSql && tbnWhere) whereSql = CacheDB.getFieldWhereSql('name', (tbnWhere as any).name);
			return sequelize.query(
				`SELECT name FROM sqlite_master WHERE type='table' ${!whereSql ? '' : `and ${whereSql}`};`,
				{
					type: QueryTypes.SELECT,
				}
			);
		}
		if (sequelize.getDialect() === 'mysql') {
			if (!whereSql && tbnWhere) whereSql = CacheDB.getFieldWhereSql('TABLE_NAME', (tbnWhere as any).name);
			return sequelize.query(
				`SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${sequelize.getDatabaseName()}' ${!whereSql ? '' : `AND ${whereSql}`};`,
				{
					type: QueryTypes.SELECT,
				}
			);
		}
		return [];
	}
	public async dbExistsTable(db: DB, tbn: string) {
		return (await this.dbGetTables(db, { name: ['=', tbn] })).length > 0;
	}
	public async dbGetInTables(r: Repo | RepoOptionsTbnWhere, query: (repo: Repo) => Promise<any>) {
		let repo: Repo;
		let data: any;
		//
		if (this.isRepo(r)) {
			repo = r as Repo;
			data = await query(repo);
		} else {
			//遍历所有的表
			let { db, tbn, tbnWhere } = r as RepoOptionsTbnWhere;
			if (tbn) {
				repo = await this.getRepoByOptions(r as RepoOptions);
				data = await query(repo);
			} else {
				let sequelize = await this.getDBConnection(db);
				(r as RepoOptions).db = sequelize;
				for (let t of await this.dbGetTables(sequelize, tbnWhere)) {
					(r as RepoOptions).tbn = t.name;
					//
					let tr = await this.getRepoByOptions(r as RepoOptions);
					let td = await query(tr);
					if (td) {
						repo = tr;
						data = td;
						break;
					}
				}
			}
		}
		return data;
	}
	public async dbGetByPages(
		r: Repo | Model | RepoOptions | RepoData,
		sqlOrFields: string | CacheDB.SqlOptions[],
		page: number,
		pageSize: number,
		countField = 'id',
		raw = true
	) {
		let { db, repo } = await this.getRepoData(r);
		let sql: string;
		if (typeof sqlOrFields === 'string') sql = sqlOrFields;
		else sql = CacheDB.getLeftJoinSql(sqlOrFields);
		//
		let query = async (sql: string) => db.query(sql, { type: QueryTypes.SELECT, raw: true });
		let pageData = await CacheDB.doPage(page, pageSize, countField, sql, query);
		if (!raw && pageData.datas?.length) {
			for (let i = 0; i < pageData.datas.length; i++) {
				pageData.datas[i] = repo.build(pageData.datas[i], { raw: true, isNewRecord: false });
			}
		}
		return pageData;
	}
	//Sequelize封装方法
	public async seqGetIn<T = any>(
		r: Repo | Model | RepoOptions | RepoData,
		selFields: undefined | string | string[],
		inField: string,
		inValues: any[],
		additionalWhere?: WhereOptions<any>,
		order: Order = [['id', 'ASC']],
		raw = true
	): Promise<T[]> {
		let { repo } = await this.getRepoData(r);
		let attributes = !selFields ? undefined : !Array.isArray(selFields) ? selFields.split(',') : selFields;
		let where = { [inField]: inValues, ...additionalWhere };
		return repo.findAll({ attributes, where, order, raw }) as any;
	}
	public async seqBulkCreate(
		r: Repo | Model | RepoOptions | RepoData,
		data: any | any[],
		updateFields?: BulkCreatUpdateFields,
		conflictFields?: BulkCreatConflictFields
	) {
		let datas = !Array.isArray(data) ? [data] : (data as any);
		if (typeof updateFields === 'string') {
			updateFields = updateFields.split(',');
			if (updateFields.indexOf('updatedAt') < 0) updateFields.push('updatedAt');
		} else if ((updateFields as any)?.exclude) {
			let { exclude } = updateFields as any;
			if (typeof exclude === 'string') exclude = exclude.split(',');
			updateFields = [];
			for (let d of datas) {
				for (let k in d) {
					if (updateFields.indexOf(k) < 0 && exclude.indexOf(k) < 0) {
						updateFields.push(k);
					}
				}
			}
			if (exclude.indexOf('updatedAt') < 0 && updateFields.indexOf('updatedAt') < 0) {
				updateFields.push('updatedAt');
			}
		}
		if (typeof conflictFields === 'string') {
			conflictFields = conflictFields.split(',');
		}
		let { repo } = await this.getRepoData(r);
		let dbData = await repo.bulkCreate(datas, {
			ignoreDuplicates: true,
			updateOnDuplicate: updateFields as string[],
			conflictAttributes: conflictFields as string[],
		});
		return !Array.isArray(data) ? dbData[0] : dbData;
	}
	public async seqDelete(
		r: Repo | Model | RepoOptions | RepoData,
		inField: string,
		inValues: any[],
		additionalWhere?: WhereOptions<any>,
		force = false
		//
	) {
		let { repo } = await this.getRepoData(r);
		return repo.destroy({ where: { [inField]: inValues, ...additionalWhere }, force });
	}
}
