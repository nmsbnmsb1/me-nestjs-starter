import path from 'node:path';

import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception';
import { getConnectionToken } from '@nestjs/sequelize';
import { SequelizeCoreModule } from '@nestjs/sequelize/dist/sequelize-core.module';
import * as CacheDB from 'me-cache-db';
import { Model, Op, Order, QueryTypes, Sequelize } from 'sequelize';
import { ModelCtor, getAttributes } from 'sequelize-typescript';

import { ConfigService } from '@libs/config';

export type DB = string | Sequelize;
export type Repo = ModelCtor;
export interface RepoOptions {
	db: DB;
	tbn: string;
	tmodel: ModelCtor;
}
export interface RepoOptionsTbnLike {
	db: DB;
	tbn?: string;
	tbnLike?: string;
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

export function getSequelizeConfig(name: string, thisConfig: any, dbConfig: any) {
	let baseConfig = dbConfig[`base_${thisConfig.dialect}`];
	let sequelizeConfig = {
		database: name,
		autoLoadModels: true,
		synchronize: true,
		repositoryMode: true,
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
	public getTbnAlias(tbn: string) {
		let index = tbn.indexOf(':');
		return index < 0 ? tbn : tbn.substring(index + 1);
	}
	public isRepo(r: Repo | Partial<RepoOptions>) {
		return typeof r === 'function';
	}
	public async getRepoByOptions({ db, tbn, tmodel }: RepoOptions) {
		let sequelize = typeof db === 'string' ? await this.getDBConnection(db) : db;
		if (!sequelize.isDefined(tbn)) {
			await sequelize
				.define(tbn, getAttributes(tmodel.prototype || tmodel), { tableName: tbn, timestamps: true, paranoid: true })
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
		return repo as Repo;
	}
	public async getRepoData(r: Repo | Model | RepoOptions | RepoData): Promise<RepoData> {
		if ((r as any).$data) return (r as any).$data;
		//RepoData
		if ((r as RepoData).db && (r as RepoData).repo && (r as RepoData).rid) return r as RepoData;
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
			return ((r as any).$data = data);
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
	//Fields
	//Fields
	public getRepoAllFields(r: Repo) {
		let keys: any;
		try {
			keys = r.getAttributes();
		} catch (e) {
			keys = {
				id: 'id',
				...Reflect.getMetadata('sequelize:attributes', r.prototype),
				createdAt: '',
				updatedAt: '',
				deletedAt: '',
			};
		}
		return Object.keys(keys);
	}
	//Sel & update & delete
	public async dbShowTables(db: DB, tbnLike?: string): Promise<{ name: string }[]> {
		let sequelize = typeof db === 'string' ? await this.getDBConnection(db) : db;
		if (sequelize.getDialect() === 'sqlite') {
			return sequelize.query(
				`SELECT name FROM sqlite_master WHERE type='table' ${!tbnLike ? '' : `and name like '${tbnLike}'`};`,
				{ type: QueryTypes.SELECT }
			);
		}
		return [];
	}
	public async dbExistsTable(db: DB, tbnLike: string) {
		return (await this.dbShowTables(db, tbnLike)).length > 0;
	}
	public async dbGetIn(
		r: Repo | Model | RepoOptions | RepoData,
		field: string,
		values: any[],
		selFields: string | string[],
		order: Order = [['id', 'ASC']],
		raw = true
	) {
		let { repo } = await this.getRepoData(r);
		let attributes = !Array.isArray(selFields) ? selFields.split(',') : selFields;
		let where = { [field]: { [Op.in]: values } };
		return repo.findAll({ attributes, where, order, raw });
	}
	public async dbGetInTables(r: Repo | RepoOptionsTbnLike, query: (repo: Repo) => Promise<any>) {
		let repo: Repo;
		let data: any;
		//
		if (this.isRepo(r)) {
			repo = r as Repo;
			data = await query(repo);
		} else {
			//遍历所有的表
			let { db, tbn, tbnLike } = r as RepoOptionsTbnLike;
			if (tbn) {
				repo = await this.getRepoByOptions(r as RepoOptions);
				data = await query(repo);
			} else {
				let sequelize = await this.getDBConnection(db);
				(r as RepoOptions).db = sequelize;
				for (let t of await this.dbShowTables(sequelize, tbnLike)) {
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
	public async dbBulkCreate(
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
	public async dbDelete(r: Repo | Model | RepoOptions | RepoData, field: string, values: any[], force = false) {
		let { repo } = await this.getRepoData(r);
		return repo.destroy({ where: { [field]: values }, force });
	}
}
