import path from 'path';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception';
import { getConnectionToken } from '@nestjs/sequelize';
import { SequelizeCoreModule } from '@nestjs/sequelize/dist/sequelize-core.module';
import { Sequelize, QueryTypes, Model, Order, Op } from 'sequelize';
import { ModelCtor, getAttributes } from 'sequelize-typescript';
import { ConfigService } from '@libs/config';

export type DB = string | Sequelize;
export type RepoOptions = { db: DB; tbn: string; tmodel: ModelCtor };
export type RepoOptionsTbnLike = { db: DB; tbn?: string; tbnLike?: string; tmodel: ModelCtor };
export type Repo = ModelCtor;
export type RepoData = {
	db: Sequelize;
	dbn: string;
	tbn: string;
	tbnAlias: string;
	tmodel: ModelCtor;
	repo: Repo;
	rid: string;
};

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

	//获取一个数据库连接
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
			//
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
	public isRepo(r: Repo | Partial<RepoOptions>) {
		return typeof r === 'function';
	}
	public getTbnAlias(tbn: string) {
		let index = tbn.indexOf(':');
		return index < 0 ? tbn : tbn.substring(index + 1);
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
		if (!repo.$options)
			repo.$options = {
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
	public async getRepoData(r: Repo | Model | RepoOptions | any): Promise<RepoData> {
		if (r.$options) return r.$options;
		//
		if (r instanceof Model) {
			let options: any = {};
			options.db = r.sequelize;
			options.dbn = r.sequelize.getDatabaseName();
			options.tbn = (r.constructor as any).getTableName();
			options.tbnAlias = this.getTbnAlias(options.tbn);
			options.tmodel = r.constructor;
			options.repo = r.constructor;
			options.rid = `${options.dbn}.${options.tbn}`;
			return ((r as any).$options = options);
		}
		if (typeof r === 'function') {
			let options: any = {};
			options.db = r.sequelize;
			options.dbn = r.sequelize.getDatabaseName();
			options.tbn = r.getTableName();
			options.tbnAlias = this.getTbnAlias(options.tbn);
			options.tmodel = r;
			options.repo = r;
			options.rid = `${options.dbn}.${options.tbn}`;
			return (r.$options = options);
		}
		//
		// let sequelize = typeof r.db === 'string' ? await this.getDBConnection(r.db) : r.db;
		// let dbn = sequelize.getDatabaseName();
		// let tbn = r.tbn;
		// if (sequelize.isDefined(tbn)) {
		// 	let options: any = { db: sequelize, dbn, tbn };
		// 	options.tbnAlias = this.getTbnAlias(tbn);
		// 	options.tmodel = r.tmodel;
		// 	options.repo = sequelize.models[options.tbn];
		// 	options.rid = `${options.dbn}.${options.tbn}`;
		// 	return ((r as any).$options = options);
		// }
		return ((await this.getRepoByOptions(r)) as any).$options;
	}
	//db
	public async showTables(db: DB, tbnLike?: string): Promise<{ name: string }[]> {
		let sequelize = typeof db === 'string' ? await this.getDBConnection(db) : db;
		if (sequelize.getDialect() === 'sqlite') {
			return sequelize.query(
				`SELECT name FROM sqlite_master WHERE type='table' ${!tbnLike ? '' : `and name like '${tbnLike}'`};`,
				{ type: QueryTypes.SELECT }
			);
		}
		return [];
	}
	public async existsTable(db: DB, tbnLike: string) {
		return (await this.showTables(db, tbnLike)).length > 0;
	}
	public async dbGetIn(
		r: Repo | RepoOptions,
		field: string,
		values: any[],
		selFields: string | string[],
		order: Order = [['id', 'ASC']],
		raw: boolean = true
	) {
		let repo = this.isRepo(r) ? r : (await this.getRepoData(r)).repo;
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
				//
				for (let t of await this.showTables(sequelize, tbnLike)) {
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
	public async dbBulkCreate(
		r: Repo,
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
		let dbData = await r.bulkCreate(datas, {
			ignoreDuplicates: true,
			updateOnDuplicate: updateFields as string[],
			conflictAttributes: conflictFields as string[],
		});
		return !Array.isArray(data) ? dbData[0] : dbData;
	}
	public async dbDelete(r: Repo, field: string, values: any[], force = false) {
		return r.destroy({ where: { [field]: values }, force });
	}
}
